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

        // 클라이언트 메시지 수신 처리 (필요에 따라 추가 가능)
        ws.on('message', (message) => {
            console.log(`클라이언트로부터 메시지 수신: ${message}`);
            // 여기서 수신된 메시지에 대한 추가 로직을 구현할 수 있습니다.
        });

        // 오류 발생 시 처리
        ws.on('error', (error) => {
            console.error('WebSocket 오류 발생:', error);
        });
    });

    console.log('WebSocket 서버가 시작되었습니다.');
}

// 알림 전송 함수
function sendNotification(message) {
    console.log(`알림 전송: ${message}`);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'notification', message }));
        }
    });
}

// 흉기 감지 알림 전송 함수 (추가 기능)
function broadcastAlert(message) {
    console.log(`흉기 감지 알림 전송: ${message}`);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'alert', message }));
        }
    });
}

module.exports = { createWebSocketServer, sendNotification, broadcastAlert };