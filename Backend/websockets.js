const WebSocket = require("ws");
const jwt = require("jsonwebtoken"); // JWT 토큰 사용을 가정
const db = require("./models/db");
const { sendPushNotification } = require("./onesignalService");
require("dotenv").config({ path: "./.env" }); // .env 파일 경로 명시

// OneSignal API 키 및 앱 ID 설정 (하드코딩)
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const BASE_URL = process.env.BASE_URL || 'https://localhost:5000'; 

let clients = [];

function createWebSocketServer(server) {

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    // URL에서 쿼리 파라미터로 전달된 JWT 토큰 추출
    const params = new URLSearchParams(req.url.split("?")[1]);
    const token = params.get("token");


    if (token) {
      try {
        // JWT 토큰 검증
        const decodedToken = jwt.verify(token, "your_jwt_secret"); // 'process.env.JWT_SECRET'는 실제 비밀키로 변경
        const userRole = decodedToken.role; // 역할 정보 추출
        console.log(userRole);
        console.log(decodedToken);

        // 클라이언트와 역할 저장
        clients.push({ ws, role: userRole });
        console.log(`새로운 클라이언트가 연결되었습니다. 역할: ${userRole}`);
        console.log(`현재 연결된 클라이언트 수: ${clients.length}`);
      } catch (err) {
        console.error("유효하지 않은 토큰:", err);
        ws.close(); // 유효하지 않은 토큰이면 연결 종료
      }
    } else {
      console.error("토큰이 제공되지 않았습니다.");
      ws.close(); // 토큰이 없으면 연결 종료
    }

    ws.on("close", () => {
      clients = clients.filter((client) => client.ws !== ws);
      console.log("클라이언트 연결이 해제되었습니다.");
    });

    ws.on("error", (error) => {
      console.error("WebSocket 오류 발생:", error);
    });
  });

  console.log("WebSocket 서버가 시작되었습니다.");
}

// 알림 전송 함수 (admin 역할에게만 전송)
async function sendNotification(message) {
  console.log(`알림 전송: ${message}`);

  // 데이터베이스에서 admin인 사용자 조회
  // const admins = await db.executeQuery("SELECT * FROM users WHERE role = 'admin'");

  clients.forEach((client) => {
    if (client.role === "admin" && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: "notification", message }));
    }
  });
}

// 회원가입 알림 전송 함수 (master 역할에게만 전송)
async function sendMember(message) {
  console.log(`회원 알림 전송: ${message}`);

  clients.forEach((client) => {
    if (client.role === "master" && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: "register", message }));
    }
  });
}

// 흉기 감지 알림 전송 함수 (추가 기능)
function broadcastAlert(message) {
  console.log(`흉기 감지 알림 전송: ${message}`);
  clients.forEach((client) => {
    if (client.role === "admin" && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: "alert", message }));
    }
  });
}




function broadcastAlertFlutter(imageUrl, storeName, detectionTime) {
    console.log("broadcastAlertFlutter 함수가 호출되었습니다."); // 함수가 호출되었는지 확인
    console.log(
      `전달된 인자들: imageUrl=${imageUrl}, storeName=${storeName}, detectionTime=${detectionTime}`
    );
  
    // 1. OneSignal 푸시 알림 전송
    db.executeQuery('SELECT external_user_id FROM Users')
      .then((rows) => {
        const userIds = rows
          .map((row) => row.external_user_id)
          .filter((id) => id !== null);
        console.log(rows);
  
        if (userIds.length > 0) {
          // imagePath 대신 imageUrl을 사용하도록 수정
          const fullImageUrl = `${BASE_URL}${imageUrl}`;
          const notificationData = {
            app_id: ONESIGNAL_APP_ID,
            include_external_user_ids: userIds,
            headings: { en: "알림: 위험 상황 발생" },
            contents: {
              en: `${storeName}에서 ${detectionTime}에 흉기 사건이 감지되었습니다.`,
            },
            // big_picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHQSlp-XpvakG5gepaJ08stmv7YZLgwmgmFg&s',            
            // Android에서 큰 텍스트를 표시하기 위한 설정
            // android_accent_color: "#00FF00", // 색상 변경 가능
            // small_icon: 'askmelogo',
            // large_icon: `https://postfiles.pstatic.net/MjAyNDExMTJfMjUz/MDAxNzMxMzk1MDg3OTI3.mPDIKY_31mF_NCR_zeMqh62CAKeFUiZuQEsGAD-1SRIg.u2MmNlY9Yy_eV4LBBMJG5AYYQMsA0qXPUCRQaVLk9kQg.PNG/AskMeLogo.png?type=w580`, // 큰 아이콘으로도 이미지를 사용할 수 있음
          small_icon: `https://postfiles.pstatic.net/MjAyNDExMTJfMjUz/MDAxNzMxMzk1MDg3OTI3.mPDIKY_31mF_NCR_zeMqh62CAKeFUiZuQEsGAD-1SRIg.u2MmNlY9Yy_eV4LBBMJG5AYYQMsA0qXPUCRQaVLk9kQg.PNG/AskMeLogo.png?type=w580`, // 큰 아이콘으로도 이미지를 사용할 수 있음
            
          };
  
          console.log(notificationData, "푸시데이타");
  
          sendPushNotification(userIds, notificationData);
        } else {
          console.log("푸시 알림을 보낼 외부 사용자 ID가 없습니다.");
        }
      })
      .catch((error) => {
        console.error("푸시 알림 전송 중 오류 발생:", error);
      });
  
    // 2. WebSocket으로 실시간 알림 전송
    const message = {
      type: "alert",
      imageUrl: imageUrl, // 여기도 일관되게 imageUrl 사용
      storeName: storeName,
      detectionTime: detectionTime,
    };
  
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        console.log(`전송할 메시지 (WebSocket): ${JSON.stringify(message)}`);
        client.ws.send(JSON.stringify(message));
      } else {
        console.log("WebSocket이 열려 있지 않습니다.");
      }
    });
  }

module.exports = {
  createWebSocketServer,
  sendNotification,
  broadcastAlert,
  sendMember,
  broadcastAlertFlutter,
};
