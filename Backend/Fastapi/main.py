from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse, JSONResponse
import uvicorn
import json
import asyncio
import httpx
from count_heatmap import counter_frames, heatmaps_frames, stats
from ultralytics import YOLO
import cv2
import numpy as np
import threading
import queue
import time
from concurrent.futures import ThreadPoolExecutor
import io
from datetime import datetime
from collections import defaultdict
import os
from db import get_db_connection, get_db_cursor
from pydantic import BaseModel
import requests
import aiohttp
from fastapi.staticfiles import StaticFiles
import logging


# FastAPI 애플리케이션 생성
app = FastAPI()
app.mount("/uploads", StaticFiles(directory="../uploads"), name="uploads")
app.mount("/videos", StaticFiles(directory="../uploads/videos"), name="videos")

# CORS 설정
origins = ["https://localhost:3000", "https://localhost:5000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# YOLO 모델 초기화 (모델 이름을 함수 내로 옮기지 않음)
model = YOLO("yolo11n.pt")  # 기본 모델

def generate_frames(camera_id=0, model_name="yolo11n.pt", record_video=False, save_directory_vid="../uploads/videos"):
    model = YOLO(model_name)
    
    # 비디오 캡처 시작
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"Failed to open video source: {camera_id}")
        return

    # 비디오 저장을 위한 VideoWriter 객체 (녹화 기능 활성화 시)
    if record_video:
        # 파일 이름 생성
        base_filename = "video"
        extension = ".mp4"
        video_filename = generate_unique_filename(save_directory_vid, base_filename, extension)

        # MP4 코덱 설정
        fourcc = cv2.VideoWriter_fourcc(*'avc1')  # 'avc1'은 H.264 코덱의 FourCC
        out = cv2.VideoWriter(video_filename, fourcc, 30.0, (640, 480))
        print(f"Video recording started: {video_filename}")

    # 트랙 히스토리 저장
    track_history = defaultdict(lambda: [])

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # YOLO 모델을 사용하여 프레임 추적
        results = model.track(frame, classes=[0, 43], persist=True)

        if results and results[0].boxes is not None:
            # YOLO 기본 스타일로 시각화
            annotated_frame = results[0].plot()
            boxes = results[0].boxes.xywh.cpu().numpy().astype(int) if results[0].boxes.xywh is not None else []
            track_ids = results[0].boxes.id.int().cpu().tolist() if results[0].boxes.id is not None else []

            # Track 시각화 추가
            for box, track_id in zip(boxes, track_ids):
                x, y, w, h = box
                center_x, center_y = x, y

                # 트랙 히스토리에 좌표 추가
                track_history[track_id].append((center_x, center_y))
                if len(track_history[track_id]) > 30:  # 최대 30개 점 유지
                    track_history[track_id].pop(0)

                # 트랙 경로 시각화
                points = np.array(track_history[track_id], dtype=np.int32).reshape((-1, 1, 2))
                cv2.polylines(annotated_frame, [points], isClosed=False, color=(0, 255, 255), thickness=2)
        else:
            annotated_frame = frame

        # 프레임을 비디오로 녹화
        if record_video:
            out.write(annotated_frame)

        # 프레임 인코딩 및 스트리밍 준비
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame = buffer.tobytes()

        if not ret:
            print("Failed to encode frame")
            break
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    # 리소스 해제
    cap.release()
    if record_video:
        out.release()
        
def save_counts_every_10_seconds(device_id):
    while True:
        in_count = stats.in_count  # 현재 입장 인원 수 가져오기
        out_count = stats.out_count  # 현재 퇴장 인원 수 가져오기
        
        # 데이터베이스에 저장 호출 (db.py에서 정의된 함수 사용)
        try:
            save_person_count_to_db(device_id, in_count, out_count)
            logging.info(f"DB에 저장 완료: IN={in_count}, OUT={out_count}")
        
        except Exception as e:
            logging.error(f"DB 저장 중 오류 발생: {e}")
        
        time.sleep(300)  # 10초 대기 (테스트용)

# FastAPI 서버 시작 시 스레드로 주기적으로 카운트 저장 작업 시작
@app.on_event("startup")
async def startup_event():
    device_id = 1  # CCTV 장치 ID 설정 (예: 정문 CCTV)
    
    # 별도의 스레드로 주기적으로 카운트 저장 작업 시작 (5분마다)
    threading.Thread(target=save_counts_every_10_seconds, args=(device_id,), daemon=True).start()

def save_person_count_to_db(device_id, in_count, out_count):
    """데이터베이스에 입장/퇴장 인원 수 저장"""
    try:
        # 데이터베이스 연결
        connection = get_db_connection()
        cursor = connection.cursor()

        # SQL 쿼리 작성 (pedetection_time을 올바르게 사용)
        sql = """
            INSERT INTO CCTV_Person (device_id, pedetection_time, people_count_in, people_count_out)
            VALUES (%s, %s, %s, %s)
        """
        
        # 현재 시간 기록
        pedetection_time = datetime.now()

        # 디버깅용 로그 출력 (실제 쿼리와 값 확인)
        logging.info(f"Executing SQL: {sql}")
        logging.info(f"With values: device_id={device_id}, pedetection_time={pedetection_time}, in_count={in_count}, out_count={out_count}")

        # 쿼리 실행 및 커밋
        cursor.execute(sql, (device_id, pedetection_time, in_count, out_count))
        connection.commit()

        logging.info(f"DB 저장 완료: device_id={device_id}, IN={in_count}, OUT={out_count}")

    except Exception as db_error:
        # 오류 발생 시 롤백 및 오류 로그 출력
        if connection:
            connection.rollback()
        logging.error(f"DB 저장 중 오류 발생: {db_error}")
    
    finally:
        # 리소스 해제 및 로그 출력
        if cursor:
            cursor.close()
            logging.info("DB 커서 닫힘")
        if connection:
            connection.close()
            logging.info("DB 연결 닫힘")



# 비디오 스트리밍 라우트에서 녹화 기능 비활성화
@app.get('/video_feed1')
async def video_feed1(record: bool = False):
    return StreamingResponse(generate_frames(0, "yolo11n.pt", record_video=record), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get('/video_feed2')
async def video_feed2(record: bool = False):
    return StreamingResponse(generate_frames(0, "yolo11n-seg.pt", record_video=record), media_type='multipart/x-mixed-replace; boundary=frame')

# 카운트 
@app.get('/video_feed3')
async def video_feed3():
    return StreamingResponse(counter_frames(1), media_type='multipart/x-mixed-replace; boundary=frame')

# 히트맵
@app.get('/video_feed4')
async def video_feed4():
    return StreamingResponse(heatmaps_frames(1), media_type='multipart/x-mixed-replace; boundary=frame')

class DetectionData(BaseModel):
    detected: bool
    device_id: int
    image_path: str = None
    video_path: str = None

@app.post('/detect_weapon')
async def detect_weapon(data: DetectionData):
    save_directory_img = "../uploads/images"
    save_directory_vid = "../uploads/videos"

    level = 'high'

    # 새로운 파일 이름 생성 (단 한번만 호출)
    image_filename = generate_unique_filename(save_directory_img, "captured", ".jpg")
    video_filename = generate_unique_filename(save_directory_vid, "video", ".mp4")

    async def save_to_database():
        """데이터베이스에 알림 정보 저장"""
        try:
            connection = get_db_connection()
            cursor = connection.cursor()

            insert_query = """
                INSERT INTO Alert_Log (detection_time, detected_weapon, level, device_id, image_path, video_path)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                datetime.datetime.now(), 'Knife', level, data.device_id, image_filename, video_filename))
            
            # 생성된 alert_id 가져오기
            alert_id = cursor.lastrowid

            # Anomaly_Resolution에 데이터 저장
            insert_anomaly_query = """
                INSERT INTO Anomaly_Resolution (device_id, anomaly_type, alert_id)
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_anomaly_query, (
                data.device_id, '흉기탐지', alert_id))
                
            connection.commit()

            print("DB 저장 완료")
            return image_filename, video_filename

        except Exception as db_error:
            if connection:
                connection.rollback()  # 오류 시 롤백
            print(f"DB 저장 중 오류 발생: {db_error}")
            raise Exception(f"DB 저장 중 오류 발생: {str(db_error)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    async def send_alert_to_node():
        """Node.js 서버로 알림 요청 전송"""
        alert_payload = {"detected": True, "message": "흉기 감지됨!"}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post("https://localhost:5000/alert", json=alert_payload, ssl=False) as response:
                    response.raise_for_status()
                    print("Node.js 서버로 알림 전송 성공")
        except Exception as e:
            print(f"Node.js 서버 알림 전송 실패: {e}")
            raise Exception(f"Node.js 서버 알림 전송 실패: {str(e)}")

    try:
        # 데이터베이스 저장 및 알림 전송을 비동기로 병렬 실행
        image_video_task = asyncio.create_task(save_to_database())
        alert_task = asyncio.create_task(send_alert_to_node())

        # 두 작업이 모두 완료될 때까지 대기
        image_filename, video_filename = await asyncio.gather(image_video_task, alert_task)

        return {
            "message": "Weapon detection alert saved to database and alert sent",
            "image_path": image_filename,
            "video_path": video_filename
        }

    except Exception as e:
        return {"error": f"예기치 않은 오류 발생: {str(e)}"}

# 파일 이름 생성 함수
def generate_unique_filename(directory, base_filename, extension):
    # 디렉터리 내 파일이 존재하는지 확인 및 일련번호 생성
    os.makedirs(directory, exist_ok=True)
    next_number = 1
    
    while True:
        new_filename = f"{base_filename}_{next_number}{extension}"
        full_path = os.path.join(directory, new_filename).replace("\\", "/")
        
        # 파일이 존재하지 않으면 해당 이름을 사용
        if not os.path.exists(full_path):
            return full_path
        # 파일이 이미 존재하면 숫자 증가
        next_number += 1

@app.websocket("/ws/count_stats")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            count_data = {
                "in_count": stats.in_count,
                "out_count": stats.out_count,
                "classwise_counts": stats.classwise_counts
            }
            await manager.broadcast(json.dumps(count_data))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
# 카메라 프론트에 연결
@app.get('/capture_image')
async def capture_image():
    camera_id = 0
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        return JSONResponse(status_code=500, content={"error": "Cannot access camera"})

    ret, frame = cap.read()
    cap.release()
    if not ret:
        return JSONResponse(status_code=500, content={"error": "Cannot capture image"})

    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        return JSONResponse(status_code=500, content={"error": "Cannot encode image"})

    save_directory_img = "../uploads/images"
    os.makedirs(save_directory_img, exist_ok=True)
    
    # 파일 이름 생성
    base_filename = "captured"
    extension = ".jpg"
    image_filename = generate_unique_filename(save_directory_img, base_filename, extension)

    with open(image_filename, 'wb') as f:
        f.write(buffer)

    try:
        with get_db_cursor() as cursor:
            cursor.execute("INSERT INTO Alert_Log (image_path) VALUES (%s)", (image_filename,))
            cursor.connection.commit()
    except Exception as e:
        print(f"Error saving to DB: {e}")

    image_stream = io.BytesIO(buffer.tobytes())
    headers = {"image_path": image_filename}
    return StreamingResponse(image_stream, media_type="image/jpeg", headers=headers)

@app.get('/')  # Root route
async def index():
    return {"message": "Webcam streaming server is running."}

@app.on_event("shutdown")  # Graceful shutdown
def shutdown_event():
    pass

# FastAPI 애플리케이션 실행
if __name__ == '__main__':
    # threading.Thread(target=stream_to_server1, args=(0,)).start()  # 카메라 0으로 첫 번째 서버에 스트리밍
    # threading.Thread(target=stream_to_server2, args=(0,)).start()  # 카메라 0으로 두 번째 서버에 스트리밍
    uvicorn.run(app, host='127.0.0.1', port=8000, ssl = False)
