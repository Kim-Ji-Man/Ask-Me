import cv2
import asyncio
import numpy as np
import time
from collections import defaultdict
from ultralytics import YOLO, solutions
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 카운팅 상태 저장
class CountStatistics:
    def __init__(self):
        self.in_count = 0
        self.out_count = 0
        self.classwise_counts = defaultdict(lambda: {"IN": 0, "OUT": 0})

stats = CountStatistics()

# person count
def counter_frames(camera_id):

    # 전역변수 설정
    global stats
    
    # 비디오 캡처 시작
    cap = cv2.VideoCapture(camera_id)
    assert cap.isOpened(), "Error reading video file"

    # line for object counting
    line_points = [(20, 350), (1000, 350)]

    # Init Object Counter
    counter = solutions.ObjectCounter(
        region=line_points,
        model="yolo11n.pt",
        classes=[0]
    )

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Video frame is empty or video processing has been successfully completed.")
            break

        try:
            # 카운트 수행
            results = counter.count(frame)

            # 디버깅: classwise_counts 출력
            print("Counter classwise_counts:", dict(counter.classwise_counts))

            if results is not None:
                # classwise_counts 업데이트
                for cls_name, count_data in counter.classwise_counts.items():
                    stats.classwise_counts[cls_name]["IN"] = count_data["IN"]
                    stats.classwise_counts[cls_name]["OUT"] = count_data["OUT"]

                # 현재 카운트 상태를 stats에 반영
                stats.in_count = stats.classwise_counts['person']['IN']
                stats.out_count = stats.classwise_counts['person']['OUT']
                
                # 프레임에 IN/OUT 카운트 표시
                cv2.putText(frame, f"In Count: {stats.in_count}", (50, 150), # 텍스트가 화면에 나타날 좌표
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                cv2.putText(frame, f"Out Count: {stats.out_count}", (50, 100), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                
                 # 저장된 데이터 출력
                print("Updated classwise_counts:", dict(stats.classwise_counts))  # 업데이트된 카운트 출력

            # 프레임 인코딩
            success, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            
        except Exception as e:
            print(f"Error during counting: {e}")

    cap.release()

#  person heatmap
def heatmaps_frames(camera_id):

    # 비디오 캡처 시작
    cap = cv2.VideoCapture(camera_id)
    assert cap.isOpened(), "Error reading video file"

    # Init heatmap
    heatmap = solutions.Heatmap(
        model="yolo11n.pt",
        colormap=12,
        classes=[0]
    )

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Video frame is empty or video processing has been successfully completed.")
            break

        try:
            frame = heatmap.generate_heatmap(frame)
            # 프레임 인코딩 및 스트리밍 준비
            success, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            
        except Exception as e:
            print(f"Error during counting: {e}")

    # 리소스 해제
    cap.release()
