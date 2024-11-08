import cv2
from ultralytics import YOLO, solutions
import asyncio
import numpy as np
import time
from collections import defaultdict
import threading

def generate_frames(camera_id):

    # YOLO 모델 초기화
    model = YOLO("yolo11n.pt")
    
    # 비디오 캡처 시작
    cap = cv2.VideoCapture(camera_id)
    assert cap.isOpened(), "Error reading video file"

    # 트랙 히스토리 저장
    track_history = defaultdict(lambda: [])

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Video frame is empty or video processing has been successfully completed.")
            break
        
        try:
            # YOLO 모델을 사용하여 프레임 추적
            results = model.track(frame, classes=[0, 43], persist=True)

            # YOLO 기본 스타일로 시각화
            annotated_frame = results[0].plot() if results else frame

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
            
        except Exception as e:
            print(f"Error during counting: {e}")

    # 리소스 해제
    cap.release()
