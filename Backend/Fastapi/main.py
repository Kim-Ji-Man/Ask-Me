from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
import uvicorn
import json
import asyncio
import httpx
from count_heatmap import counter_frames, heatmaps_frames, stats
from video_utils import generate_frames

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

# FastAPI 라우트 설정
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

# person, knife 탐지 (각도1)
@app.get('/video_feed1')
async def video_feed1():
    return StreamingResponse(generate_frames(0), media_type='multipart/x-mixed-replace; boundary=frame')

# person, knife 탐지 (각도2)
@app.get('/video_feed2')
async def video_feed2():
    return StreamingResponse(generate_frames(1), media_type='multipart/x-mixed-replace; boundary=frame')

# 카운트 
@app.get('/video_feed3')
async def video_feed3():
    return StreamingResponse(counter_frames(0), media_type='multipart/x-mixed-replace; boundary=frame')

# 히트맵
@app.get('/video_feed4')
async def video_feed4():
    return StreamingResponse(heatmaps_frames(1), media_type='multipart/x-mixed-replace; boundary=frame')


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

@app.get('/')
async def index():
    return {"message": "Webcam streaming server is running."}

# FastAPI 애플리케이션 실행
if __name__ == '__main__':
    # threading.Thread(target=stream_to_server1, args=(0,)).start()  # 카메라 0으로 첫 번째 서버에 스트리밍
    # threading.Thread(target=stream_to_server2, args=(0,)).start()  # 카메라 0으로 두 번째 서버에 스트리밍
    uvicorn.run(app, host='127.0.0.1', port=8000)
