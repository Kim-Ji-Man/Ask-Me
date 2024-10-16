require('dotenv').config();

const express = require('express');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const exampleRoutes = require('./routes/example'); 
const authRouter = require('./routes/authRouter'); 
const sessionConfig = require('./config/sessionConfig');
const cors = require('cors');
const http = require('http'); 
const fs = require('fs');
const path = require('path');
const cameraRouter = require('./routes/camera'); // 카메라 라우터 추가
const newsRoutes = require('./routes/newsRoutes') // 뉴스 라우터
const MemberRouter = require('./routes/MemberRouter') 

// Express 앱 초기화
const app = express();

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
                url: 'http://localhost:5000',
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
    apis: ['./routes/*.js'] // API 경로 수정 부분
};

const swaggerDocs = swaggerJsdoc(swaggerOption);

// 미들웨어 설정
app.use(cors());
app.use(session(sessionConfig));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 
app.use('/', exampleRoutes);
app.use('/auth', authRouter); 
app.use('/api', cameraRouter);
app.use('/api', newsRoutes);
app.use('/Member', MemberRouter);


app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

module.exports = app;
