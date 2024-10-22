from fastapi import FastAPI
import cv2
import uvicorn
from starlette.responses import StreamingResponse
import asyncio
import nest_asyncio
from fastapi.middleware.cors import CORSMiddleware

# FastAPI 애플리케이션 생성
app = FastAPI()

# CORS 설정 추가
origins = ["http://localhost:3000", "http://localhost:8300"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 현재 이벤트 루프에 nest_asyncio 적용
nest_asyncio.apply()

def generate_frames():
    cap = cv2.VideoCapture(0)
    
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

@app.get('/')
async def index():
    return {"message": "웹캠 스트리밍 서버가 실행 중입니다. /video_feed 에 접속하세요."}

# FastAPI 애플리케이션 실행
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)


# 칼라
# def generate_frames():
#     # 웹캠을 연결 (0은 기본 웹캠을 의미)
#     cap = cv2.VideoCapture(0)

#     while True:
#         # 웹캠에서 프레임을 읽음
#         success, frame = cap.read()
#         if not success:
#             break  # 만약 프레임을 읽지 못하면 반복 종료
#         else:
#             # 프레임을 JPEG 포맷으로 인코딩
#             ret, buffer = cv2.imencode('.jpg', frame)
#             frame = buffer.tobytes()

#             # 클라이언트에게 전송할 데이터 포맷
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


# 흑백
# def generate_frames():
#     # 웹캠을 연결 (0은 기본 웹캠을 의미)
#     cap = cv2.VideoCapture(0)

#     while True:
#         # 웹캠에서 프레임을 읽음
#         success, frame = cap.read()
#         if not success:
#             break  # 만약 프레임을 읽지 못하면 반복 종료
#         else:
#             # 프레임을 흑백으로 변환
#             gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

#             # 흑백 프레임을 다시 JPEG 포맷으로 인코딩
#             ret, buffer = cv2.imencode('.jpg', gray_frame)
#             frame = buffer.tobytes()

#             # 클라이언트에게 전송할 데이터 포맷
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# 흑백,해상도 경량화
# def generate_frames():
#     cap = cv2.VideoCapture(0)
    
#     while True:
#         success, frame = cap.read()
#         if not success:
#             break
        
#         # 프레임 해상도를 50%로 줄임
#         frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)

#         # 프레임을 흑백으로 변환
#         gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

#         # JPEG 포맷으로 인코딩
#         ret, buffer = cv2.imencode('.jpg', gray_frame)
#         frame = buffer.tobytes()

#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        
