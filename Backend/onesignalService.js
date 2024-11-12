const axios = require('axios');
const db = require('./models/db'); // db 객체 불러오기 (데이터베이스 연결 확인)
require('dotenv').config({ path: './.env' });  // .env 파일 경로 명시

// OneSignal API 키 및 앱 ID 설정 (환경 변수)
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://localhost:5000'; 


console.log('OneSignal App ID:', ONESIGNAL_APP_ID);
console.log('OneSignal API Key:', ONESIGNAL_API_KEY);

// 외부 사용자 ID 및 플레이어 등록 함수
const setExternalUserId = async (userId) => {  // req 대신 userId만 받음
  try {
    // 데이터베이스에서 external_user_id 확인
    const result = await db.executeQuery('SELECT external_user_id FROM Users WHERE user_id = ?', [userId]);

    let externalUserId;

    if (result.length > 0 && result[0].external_user_id) {
      console.log(`사용자 ${userId}의 외부 사용자 ID는 이미 설정되어 있습니다.`);
      externalUserId = result[0].external_user_id;
      
    } else {
      console.log(`사용자 ${userId}의 외부 사용자 ID가 설정되지 않았습니다. OneSignal에 추가 중...`);

      // 새로운 external_user_id 생성
      externalUserId = `user-${Date.now()}`;

      const response = await axios.post('https://onesignal.com/api/v1/players', {
        app_id: ONESIGNAL_APP_ID,
        external_user_id: externalUserId,
        device_type: 1 // 안드로이드 기기 (1은 Android, 0은 iOS)
      }, {
        headers: {
          'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.id) {
        console.log(`사용자 ${userId}의 외부 사용자 ID 등록 성공:`, response.data);

        // 데이터베이스에 external_user_id 업데이트
        await db.executeQuery('UPDATE Users SET external_user_id = ? WHERE user_id = ?', [externalUserId, userId]);
        
      } else {
        console.error('OneSignal 응답에 문제가 있습니다:', response.data);
        throw new Error('OneSignal 등록 실패');
      }
    }

    return externalUserId;

  } catch (error) {
    console.error(`사용자 ${userId}의 외부 사용자 ID 등록 실패:`, error.response ? error.response.data : error.message);
    throw new Error('서버 오류');
  }
};

const setExternalUserIdOnServer = async (req, res) => {
  const { userId } = req.body;  // 여전히 req.body에서 userId를 가져옴

  try {
    const externalUserId = await setExternalUserId(userId);  // 새로 만든 함수 호출

    res.status(200).json({ external_user_id: externalUserId });

  } catch (error) {
    console.error(`사용자 ${userId}의 외부 사용자 ID 등록 실패:`, error.response ? error.response.data : error.message);
    res.status(500).json({ error: '서버 오류' });
  }
};

// 푸시 알림 전송 함수
const sendPushNotification = async (userIds, notificationData) => {
    try {
        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Basic ${ONESIGNAL_API_KEY}`
        };

        // OneSignal API 호출하여 external_user_id에 기반한 푸시 알림 전송
        const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationData, { headers });
        
        console.log('푸시 알림 전송 성공:', response.data);
        
        if (response.data.errors) {
            console.error('푸시 알림 전송 중 오류 발생:', response.data.errors);
        }
    } catch (error) {
        if (error.response && error.response.data) {
            console.error('푸시 알림 전송 중 오류 발생:', error.response.data);
        } else {
            console.error('푸시 알림 전송 중 오류 발생:', error.message);
        }
    }
};

// 역할이 "guard"인 사용자에게 푸시 알림을 보내는 함수
const notifyUsers = async (imagePath, storeName, detectionTime) => {
  try {
      // 전체 사용자 조회
      const rows = await db.executeQuery("SELECT user_id, external_user_id FROM Users WHERE role = 'guard';");

      // external_user_id가 null인 사용자를 처리하기 위해 setExternalUserId 호출
      for (const row of rows) {
          if (!row.external_user_id) {
              // external_user_id가 없는 경우 OneSignal에 등록
              console.log(`사용자 ${row.user_id}의 외부 사용자 ID가 설정되지 않았습니다. 설정 중...`);
              
              await setExternalUserId(row.user_id);  // req 대신 user_id만 전달
          }
      }

      // external_user_id가 null이 아닌 사용자만 필터링
      const externalUserIds = rows.map(row => row.external_user_id).filter(id => id !== null);

      if (externalUserIds.length === 0) {
          console.log('외부 사용자 ID가 없는 사용자가 있습니다.');
          return;
      }

      // 상대경로인 imagePath에 BASE_URL을 붙여서 절대경로 생성
      const fullImageUrl = `${BASE_URL}${imagePath}`;

      // 외부 사용자 ID 목록 로그 출력
      console.log('푸시 알림 전송 대상 외부 사용자 ID 목록:', externalUserIds);

      const notificationData = {
          app_id: ONESIGNAL_APP_ID,
          include_external_user_ids: externalUserIds,
          headings: { en: '알림: 위험 상황 발생 guard' },
          contents: { en: `${storeName}에서 ${detectionTime}에 흉기 사건이 감지되었습니다.` },
          // data: { image_path: 'https://postfiles.pstatic.net/MjAyNDExMTJfMjUz/MDAxNzMxMzk1MDg3OTI3.mPDIKY_31mF_NCR_zeMqh62CAKeFUiZuQEsGAD-1SRIg.u2MmNlY9Yy_eV4LBBMJG5AYYQMsA0qXPUCRQaVLk9kQg.PNG/AskMeLogo.png?type=w580'},  // 데이터에 이미지 경로 추가
          
          // big_picture: fullImageUrl,  // Android용 이미지 URL 추가
          
          android_accent_color: 'FF0000FF',  // Android에서 큰 텍스트를 표시하기 위한 설정
          // large_icon: `https://postfiles.pstatic.net/MjAyNDExMTJfMjUz/MDAxNzMxMzk1MDg3OTI3.mPDIKY_31mF_NCR_zeMqh62CAKeFUiZuQEsGAD-1SRIg.u2MmNlY9Yy_eV4LBBMJG5AYYQMsA0qXPUCRQaVLk9kQg.PNG/AskMeLogo.png?type=w580`, // 큰 아이콘으로도 이미지를 사용할 수 있음

      };
      
      console.log(notificationData,"푸시데이타");

      // 푸시 알림 전송
      await sendPushNotification(externalUserIds, notificationData);

  } catch (error) {
      console.error('푸시 알림 전송 중 오류:', error);
  }
};
module.exports = { setExternalUserIdOnServer, sendPushNotification, notifyUsers };