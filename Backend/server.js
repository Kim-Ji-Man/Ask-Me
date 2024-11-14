require('dotenv').config();

const express = require('express');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const multer = require('multer'); // multer 추가
const exampleRoutes = require('./routes/example'); 
const authRouter = require('./routes/authRouter'); 
const sessionConfig = require('./config/sessionConfig');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cameraRouter = require('./routes/camera'); // 카메라 라우터 추가
const newsRoutes = require('./routes/newsRoutes'); // 뉴스 라우터
const MemberRouter = require('./routes/MemberRouter');
const AlimRouter = require('./routes/AlimRouter'); // 알림 라우터 추가
const ErrormRouter = require('./routes/ErrorRouter');
const storesRouter = require('./routes/storesRouter');
const authFindRoutes = require('./routes/authFindRoutes');
const MapRouter = require('./routes/MapRouter');
const kakaoLoginRouter = require('./routes/kakaoLogin');
const postRouter = require('./routes/postRouter');
const commentRouter = require('./routes/commentRouter');
const likeRouter = require('./routes/likeRouter');
const reportRouter = require('./routes/reportRouter');
const mypageRouter = require('./routes/mypageRouter');
const { createWebSocketServer, sendNotification, broadcastAlert } = require('./websockets'); 
const bodyParser = require('body-parser');
const MasterMainDashboard = require('./routes/MainDashboardRouter');
const { setExternalUserIdOnServer } = require('./onesignalService');
const { sendTest } = require('./routes/notificationRoutes.js'); // 알림 처리 파일 불러오기

// Express 앱 초기화
const app = express();

// SSL 인증서 설정 (예시)
const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert')),
};


const server = https.createServer(options, app);
createWebSocketServer(server);

// Swagger 설정
const swaggerOption = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation for the application'
        },
        servers: [
            {
                url: 'https://localhost:5000', // https 프로토콜로 설정
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOption);

// 미들웨어 설정
app.use(cors());
app.use(session(sessionConfig));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', exampleRoutes);
app.use('/auth', authRouter); 
app.use('/stores', storesRouter); 
app.use('/api', cameraRouter);
app.use('/api', newsRoutes);
app.use('/Member', MemberRouter);
app.use('/Alim', AlimRouter); // 알림 라우터 사용
app.use('/Error', ErrormRouter);
app.use('/find', authFindRoutes);
app.use('/Map', MapRouter);
app.use('/auth/kakao', kakaoLoginRouter);
app.use('/community', postRouter);
app.use('/community', commentRouter);
app.use('/community', likeRouter);
app.use('/community', reportRouter);
app.use('/mypage', mypageRouter);
app.use('/Masterdashboard', MasterMainDashboard)

app.use(bodyParser.json());

app.use(express.json({ limit: '50mb' })); // 이미지 데이터 처리 위한 크기 설정


app.post('/setExternalUserIdOnServer', setExternalUserIdOnServer);


// 이미지 업로드 엔드포인트
app.post('/upload_image', (req, res) => {
  const imgData = req.body.image;
  const base64Data = imgData.replace(/^data:image\/png;base64,/, "");

  const imgPath = path.join(__dirname, 'public/img/captured_image.png');

  fs.writeFile(imgPath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('이미지 저장 실패:', err);
      return res.status(500).send({ success: false, message: '이미지 저장 실패' });
    }
    res.send({ success: true, message: '이미지 저장 성공', path: imgPath });
  });
});

// 일반 알림 API 엔드포인트
app.post('/notify', (req, res) => {
    const { message } = req.body;
  
    if (message) {
      console.log(`일반 알림 전송: ${message}`);
      sendNotification(message); // 일반 알림 전송
    }
  
    res.status(200).send('Notification sent');
});
  
app.post("/alert", async (req, res) => {
  const { detected, message } = req.body;

  if (detected) {
    console.log('흉기 감지! 클라이언트에 알림을 전송합니다.');
    broadcastAlert(message); // WebSocket으로 알림 전송

    // 이메일 및 SMS 알림 전송
    await sendTest(); // 새로운 알림 기능 실행
    
    res.status(200).send("알림 전송 완료");
  } else {
    res.status(400).send("알림 실패");
  }
});
  

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// 서버 실행 코드
const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

