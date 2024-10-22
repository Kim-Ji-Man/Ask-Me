const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// WebSocket 서버를 Express 서버와 동일한 포트에서 실행
const PORT = 8082; // 8082번 포트로 변경
const server = app.listen(PORT, () => {
  console.log(`Node.js 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

const wss = new WebSocket.Server({ server }); // 기존의 HTTP 서버를 WebSocket 서버로 사용

// 흉기 감지 알림을 클라이언트에게 전송하는 함수
function broadcastAlert(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message }));
    }
  });
}

// FastAPI에서 흉기 감지 알림을 수신하는 라우트
app.post('/alert', (req, res) => {
  const { detected } = req.body;

  if (detected) {
    console.log('흉기 감지! 클라이언트에 알림을 전송합니다.');
    broadcastAlert('Weapon detected!');
  }

  res.status(200).send('Alert received');
});

// 클라이언트가 WebSocket에 연결되었을 때 처리
wss.on('connection', (ws) => {
  console.log('클라이언트가 연결되었습니다.');

  // 클라이언트로부터 메시지를 수신했을 때 처리
  ws.on('message', (message) => {
    console.log(`클라이언트로부터 메시지 수신: ${message}`);
    // 여기서 수신된 메시지에 대한 추가 로직을 구현할 수 있습니다.
  });

  // 클라이언트가 연결을 종료했을 때 처리
  ws.on('close', () => {
    console.log('클라이언트가 연결을 종료했습니다.');
  });

  // 오류가 발생했을 때 처리
  ws.on('error', (error) => {
    console.error('WebSocket 오류 발생:', error);
  });
});
