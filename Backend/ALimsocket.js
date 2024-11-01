const WebSocket = require('ws');

let clients = [];

// WebSocket 서버 생성 함수
function createWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    // 클라이언트 연결 시 처리
    wss.on('connection', (ws) => {
        clients.push(ws);
        console.log('새로운 클라이언트가 연결되었습니다.');

        // 클라이언트 연결 해제 시 처리
        ws.on('close', () => {
            clients = clients.filter(client => client !== ws);
            console.log('클라이언트 연결이 해제되었습니다.');
        });
    });

    console.log('WebSocket 서버가 시작되었습니다.');
}

// 알림 전송 함수
function sendNotification(message) {
    console.log(`알림 전송: ${message}`); // 알림 전송 로그 추가
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'notification', message }));
        }
    });
}

module.exports = { createWebSocketServer, sendNotification };