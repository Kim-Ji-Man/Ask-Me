from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from ultralytics import YOLO
import cv2
import httpx
import numpy as np
import threading
import queue
import time
from concurrent.futures import ThreadPoolExecutor
import uvicorn

# FastAPI 애플리케이션 생성
app = FastAPI()

# CORS 설정
origins = ["http://localhost:3000", "http://localhost:5000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOLO 모델 초기화
model = YOLO("yolo11n.pt")

# 큐와 스레드 풀 생성
task_queue = queue.Queue()
executor = ThreadPoolExecutor(max_workers=1)

# 비동기로 실행할 작업 함수
def process_task(task_id, frame):
    results = model.track(frame)
    print(f"Processed task {task_id} at {time.time()}")
    return frame

# 큐 작업을 관리하는 함수
def worker():
    while True:
        task_id, frame = task_queue.get()
        if task_id is None:  # 종료 신호
            break
        process_task(task_id, frame)
        task_queue.task_done()

# 워커 스레드 시작 (daemon: 메인 스레드가 종료될 때 자동 종료되는 기능)
worker_thread = threading.Thread(target=worker, daemon=True)
worker_thread.start()

# 프레임 생성 함수 (video_utils) --> 기존 코드
# def generate_frames(camera_id):
#     cap = cv2.VideoCapture(camera_id)
#     if not cap.isOpened():
#         print(f"Failed to open video source: {camera_id}")
#         return

#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break

#         results = model.track(frame, show=True, stream=True)

#         for result in results:
#             boxes = result.boxes.xyxy
#             confidences = result.boxes.conf
#             class_ids = result.boxes.cls

#             for i in range(len(boxes)):
#                 box = boxes[i].cpu().numpy().astype(int)
#                 confidence = confidences[i].item()
#                 class_id = int(class_ids[i].item())

#                 # 클래스 이름과 신뢰도 텍스트
#                 label = model.names[class_id]
#                 cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
#                 cv2.putText(frame, f"{label} {int(confidence * 100)}%", 
#                             (box[0], box[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

#         frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
#         ret, buffer = cv2.imencode('.jpg', frame)
#         frame = buffer.tobytes()

#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

from collections import defaultdict

# YOLO 모델 초기화 (모델 이름을 함수 내로 옮기지 않음)
# model = YOLO("yolo11n.pt")  # 기본 모델

def generate_frames(camera_id, model_name="yolo11n.pt"):
    # YOLO 모델 초기화
    model = YOLO(model_name)
    
    # 비디오 캡처 시작
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"Failed to open video source: {camera_id}")
        return

    # 트랙 히스토리 저장
    track_history = defaultdict(lambda: [])

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # YOLO 모델을 사용하여 프레임 추적
        results = model.track(frame, classes=[0, 43], persist=True)

        # YOLO 기본 스타일로 시각화
        annotated_frame = results[0].plot()

        if results and results[0].boxes is not None:
            boxes = results[0].boxes.xywh.cpu().numpy().astype(int)
            track_ids = results[0].boxes.id.int().cpu().tolist()

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

        # 프레임 인코딩 및 스트리밍 준비
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    # 리소스 해제
    cap.release()

# FastAPI 라우트 설정
@app.post("/track/")
async def track_object(background_tasks: BackgroundTasks, frame_data: bytes):
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    task_id = int(time.time() * 1000)
    task_queue.put((task_id, frame))
    background_tasks.add_task(process_task, task_id, frame)
    return {"message": "Task added to queue", "task_id": task_id}

@app.post('/detect_weapon')
async def detect_weapon():
    url = "http://localhost:8082/alert"
    data = {"detected": True}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            return {"error": f"Failed to send alert: {exc.response.status_code}"}
        except Exception as exc:
            return {"error": f"Error occurred: {str(exc)}"}
    return {"message": "Weapon detection alert sent to Express server"}

# 카메라 프론트에 연결
@app.get('/video_feed1')
async def video_feed1():
    return StreamingResponse(generate_frames(0, "yolo11n.pt"), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get('/video_feed2')
async def video_feed2():
    return StreamingResponse(generate_frames(1, "yolo11n-seg.pt"), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get('/')
async def index():
    return {"message": "Webcam streaming server is running. Visit /video_feed to view the feed."}

@app.on_event("shutdown")
def shutdown_event():
    task_queue.put((None, None))
    worker_thread.join()

# FastAPI 애플리케이션 실행
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
