from fastapi import FastAPI
import cv2
import uvicorn
from starlette.responses import StreamingResponse
import httpx  # 비동기 HTTP 요청을 위한 라이브러리
import asyncio
import nest_asyncio
from fastapi.middleware.cors import CORSMiddleware

# FastAPI 애플리케이션 생성
app = FastAPI()

# CORS 설정 추가
origins = ["http://localhost:3000", "http://localhost:5000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 현재 이벤트 루프에 nest_asyncio 적용
nest_asyncio.apply()

# 웹캠 스트리밍
def generate_frames():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("웹캠을 열 수 없습니다.")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break
        
        # 프레임 해상도를 50%로 줄임
        frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)

        # JPEG 포맷으로 인코딩
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.get('/video_feed')
async def video_feed():
    # 스트리밍 응답을 생성하고 반환
    return StreamingResponse(generate_frames(),
                             media_type='multipart/x-mixed-replace; boundary=frame')

# 흉기 감지 알림을 Express 서버에 POST 요청으로 보내는 예시
@app.post('/detect_weapon')
async def detect_weapon():
    url = "http://localhost:8082/alert"  # Express 서버의 알림 수신 경로
    data = {"detected": True}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data)
            response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        except httpx.HTTPStatusError as exc:
            return {"error": f"흉기 감지 알림 전송 실패: {exc.response.status_code}"}
        except Exception as exc:
            return {"error": f"알림 전송 중 오류 발생: {str(exc)}"}

    return {"message": "Weapon detection alert sent to Express server"}

@app.get('/')
async def index():
    return {"message": "웹캠 스트리밍 서버가 실행 중입니다. /video_feed 에 접속하세요."}

# FastAPI 애플리케이션 실행
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)