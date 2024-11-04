const WebSocket = require('ws');
const jwt = require('jsonwebtoken'); // JWT 토큰 사용을 가정
const db = require('./models/db');


let clients = [];

function createWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // URL에서 쿼리 파라미터로 전달된 JWT 토큰 추출
        const params = new URLSearchParams(req.url.split('?')[1]);
        const token = params.get('token');

        if (token) {
            try {
                // JWT 토큰 검증
                const decodedToken = jwt.verify(token, 'your_jwt_secret'); // 'process.env.JWT_SECRET'는 실제 비밀키로 변경
                const userRole = decodedToken.role; // 역할 정보 추출
                console.log(userRole);
                console.log(decodedToken);
                
                // 클라이언트와 역할 저장
                clients.push({ ws, role: userRole });
                console.log(`새로운 클라이언트가 연결되었습니다. 역할: ${userRole}`);
            } catch (err) {
                console.error('유효하지 않은 토큰:', err);
                ws.close(); // 유효하지 않은 토큰이면 연결 종료
            }
        } else {
            console.error('토큰이 제공되지 않았습니다.');
            ws.close(); // 토큰이 없으면 연결 종료
        }

        ws.on('close', () => {
            clients = clients.filter(client => client.ws !== ws);
            console.log('클라이언트 연결이 해제되었습니다.');
        });

        ws.on('error', (error) => {
            console.error('WebSocket 오류 발생:', error);
        });
    });

    console.log('WebSocket 서버가 시작되었습니다.');
}

// 알림 전송 함수 (admin 역할에게만 전송)
async function sendNotification(message) {
    console.log(`알림 전송: ${message}`);

    // 데이터베이스에서 admin인 사용자 조회
    // const admins = await db.executeQuery("SELECT * FROM users WHERE role = 'admin'");

    clients.forEach((client) => {
        if (client.role === 'admin' && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: 'notification', message }));
        }
    });
}


// 회원가입 알림 전송 함수 (master 역할에게만 전송)
async function sendMember(message) {
    console.log(`회원 알림 전송: ${message}`);

    clients.forEach((client) => {
        if (client.role === 'master' && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: 'register', message }));
        }
    });
}

// 흉기 감지 알림 전송 함수 (추가 기능)
 function broadcastAlert(message) {
    console.log(`흉기 감지 알림 전송: ${message}`);
    clients.forEach((client) => {
        if (client.role === 'admin' && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: 'alert', message }));
        }
    });
}

module.exports = { createWebSocketServer, sendNotification, broadcastAlert,sendMember };