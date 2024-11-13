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
import datetime
from collections import defaultdict
import os
from db import get_db_cursor
from pydantic import BaseModel
import requests

# FastAPI 애플리케이션 생성
app = FastAPI()

# CORS 설정
origins = ["https://localhost:3000", "https://localhost:5000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def generate_frames(camera_id=0, model_name="yolo11n.pt", record_video=False, save_directory="videos"):
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
        extension = ".avi"
        video_filename = generate_unique_filename(save_directory, base_filename, extension)

        fourcc = cv2.VideoWriter_fourcc(*'MJPG')
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

# 비디오 스트리밍 라우트에서 녹화 기능 비활성화
@app.get('/video_feed1')
async def video_feed1(record: bool = False):
    return StreamingResponse(generate_frames(0, "yolo11n.pt", record_video=record), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get('/video_feed2')
async def video_feed2(record: bool = False):
    return StreamingResponse(generate_frames(1, "yolo11n-seg.pt", record_video=record), media_type='multipart/x-mixed-replace; boundary=frame')

# 카운트 
@app.get('/video_feed3')
async def video_feed3():
    return StreamingResponse(counter_frames(0), media_type='multipart/x-mixed-replace; boundary=frame')

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
    save_directory_img = "images"
    save_directory_vid = "videos"
    level = 'high'
    
    image_filename = generate_unique_filename(save_directory_img, "captured", ".jpg")
    video_filename = generate_unique_filename(save_directory_vid, "video", ".avi")

    # 경로 생성
    image_path = image_filename
    video_path = video_filename


    # 데이터베이스에 삽입
    try:
        with get_db_cursor() as (cursor, connection):
            insert_query = """
                INSERT INTO Alert_Log (detection_time, detected_weapon, level, device_id, image_path, video_path)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
            datetime.datetime.now(), 'Knife',  level, data.device_id, image_path, video_path))
            connection.commit()  # 트랜잭션 커밋
        print("DB 저장 완료")

        # Node.js 서버에 알림 요청 전송
        alert_payload = {"detected": True, "message": "흉기 감지됨!"}
        try:
            response = requests.post("https://localhost:5000/alert", json=alert_payload)
            response.raise_for_status()
            print("Node.js 서버로 알림 전송 성공")
        except requests.RequestException as e:
            print(f"Node.js 서버 알림 전송 실패: {e}")

        return {"message": "Weapon detection alert saved to database and alert sent"}
    
    except Exception as e:
        return {"error": f"DB 저장 중 오류 발생: {str(e)}"}

# 파일 이름 생성 함수
def generate_unique_filename(directory, base_filename, extension):
    # 디렉터리 내 파일 탐색 및 일련번호 결정
    existing_files = [f for f in os.listdir(directory) if f.startswith(base_filename) and f.endswith(extension)]
    if existing_files:
        # 이미 존재하는 파일 중 일련번호를 찾아 가장 큰 값에 +1
        existing_numbers = [int(f.split('_')[-1].split('.')[0]) for f in existing_files]
        next_number = max(existing_numbers) + 1
    else:
        next_number = 1

    # 새로운 파일 이름 생성
    new_filename = f"{base_filename}_{next_number}{extension}"

    # 경로를 '/' 구분자로 고정
    directory = directory.replace("\\", "/")  # \를 /로 변환
    return f"{directory}/{new_filename}"

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
    camera_id = 1
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

    save_directory_img = "images"
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
    uvicorn.run(app, host='127.0.0.1', port=8000)
