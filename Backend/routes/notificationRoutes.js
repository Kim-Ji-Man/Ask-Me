require('dotenv').config({ path: '../.env' });
const db = require('../config/dbConfig');
const path = require('path');
const axios = require('axios');

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// external_user_id 조회 함수
async function getExternalUserId(connection, userId) {
    const query = 'SELECT external_user_id FROM Users WHERE user_id = ?';
    const [rows] = await connection.execute(query, [userId]);

    if (rows.length > 0) {
        return rows[0].external_user_id; // external_user_id 반환
    }
    return null; // 해당 userId에 대한 external_user_id가 없을 경우
}

// OneSignal 푸쉬 알림 발송 함수
async function sendPushNotification(userId, title, message, imageUrl = null, androidOptions = {}, additionalData = {}) {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_API_KEY;

    // 데이터베이스 연결
    const connection = await db.getConnection();

    try {
        // external_user_id 조회
        const externalUserId = await getExternalUserId(connection, userId);

        if (!externalUserId) {
            console.error(`external_user_id를 찾을 수 없습니다. userId: ${userId}`);
            return; // external_user_id가 없으면 함수 종료
        }

        // OneSignal payload 구성
        const payload = {
            app_id: appId,
            include_external_user_ids: [externalUserId], // external_user_id 사용
            headings: { en: title },
            contents: { en: message },
            data: additionalData,
            android_sound: "default",
            ios_sound: "default",
            small_icon: androidOptions.small_icon,
            large_icon: androidOptions.large_icon, 
            android_accent_color: androidOptions.android_accent_color,
        };

        if (imageUrl) {
            payload.big_picture = imageUrl; // Android 이미지 알림
            payload.ios_attachments = { id1: imageUrl }; // iOS 이미지 알림
        }

        // OneSignal API 호출
        const response = await axios.post('https://onesignal.com/api/v1/notifications', payload, {
            headers: {
                Authorization: `Basic ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('푸쉬 알림 성공:', response.data);
    } catch (error) {
        console.error('푸쉬 알림 실패:', error.response?.data || error.message);
    } finally {
        connection.release(); // 데이터베이스 연결 해제
    }
}

// SMS 발송 함수
async function sendSms(phoneNumber, message) {
    try {
        console.log('Sending SMS to:', phoneNumber);
        const messageInstance = await client.messages.create({
            body: message,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: phoneNumber,
        });
        console.log(`SMS sent to ${phoneNumber}: ${messageInstance.sid}`);
    } catch (error) {
        console.error(`Error sending SMS to ${phoneNumber}:`, error.message);
    }
}

// Nodemailer 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 알림 기록 저장
async function logNotification(connection, userId, alertId, method, message, status, image = null) {
    const currentTime = new Date(); // 현재 시각
    const query = `
        INSERT INTO Notification (user_id, alert_id, noti_method, message, status, sent_at, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [userId, alertId, method, message, status, currentTime, image]);
}

// 이미지 경로
async function getAlertImagePath(connection, alertId) {
    const query = 'SELECT image_path FROM Alert_Log WHERE alert_id = ?';
    const [rows] = await connection.execute(query, [alertId]);

    if (rows.length > 0) {
        const relativePath = rows[0].image_path;
        const absolutePath = path.resolve(__dirname, relativePath); 
        return absolutePath;
    }
    return null;
}

// 기기 위치를 가져오는 함수
async function getDeviceLocation(connection, deviceId) {
    const query = 'SELECT location FROM Detection_Device WHERE device_id = ?';
    const [rows] = await connection.execute(query, [deviceId]);

    if (rows.length > 0) {
        return rows[0].location;
    }
    return null; // 위치 정보가 없으면 null 반환
}

// 매장 정보를 가져오는 함수
async function getStoreInfo(connection, deviceId) {
    const query = 'SELECT store_id FROM Detection_Device WHERE device_id = ?';
    const [deviceRows] = await connection.execute(query, [deviceId]);

    if (deviceRows.length > 0) {
        const storeId = deviceRows[0].store_id;
        // store_id로 매장 정보 조회
        const storeQuery = 'SELECT name, address FROM Stores WHERE store_id = ?';
        const [storeRows] = await connection.execute(storeQuery, [storeId]);
        if (storeRows.length > 0) {
            return storeRows[0]; // 매장 이름과 주소 반환
        }
    }
    return null; // 매장 정보가 없으면 null 반환
}

async function sendTest() {
    try {
        console.log('3초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 비동기 대기
        console.log('딜레이 완료, sendTest 실행 시작');

        // 데이터베이스 연결
        const connection = await db.getConnection();
        console.log('success');

        // 수신자 이메일, 전화번호 가져오기 (Users 테이블에서)
        const [users] = await connection.execute('SELECT user_id, email, phone_number FROM Users WHERE email IS NOT NULL');
        console.log('Users retrieved:', users);

        // Alert_Log에서 가장 최근 alert_id 가져오기
        const [alerts] = await connection.execute('SELECT alert_id, device_id FROM Alert_Log ORDER BY created_at DESC LIMIT 1');
        const alert = alerts.length > 0 ? alerts[0] : null;

        if (!alert) {
            console.error('No alert found in Alert_Log.');
            return;
        }

        const alertId = alert.alert_id;
        const deviceId = alert.device_id;

        // 기기 위치 가져오기
        const location = await getDeviceLocation(connection, deviceId);
        console.log('Device location:', location);

        // 매장 정보 가져오기
        const storeInfo = await getStoreInfo(connection, deviceId);
        console.log('Store info:', storeInfo);

        // 알림 이미지 경로 가져오기
        const imagePath = await getAlertImagePath(connection, alertId);
        console.log('Image path:', imagePath);

        // 이메일 및 SMS 메시지 내용
        const storeMessage = storeInfo ? `매장명: ${storeInfo.name}, 주소: ${storeInfo.address}` : '매장 정보 없음';
        const message = `${location || '알 수 없음'}에서 흉기 탐지 알림입니다. ${storeMessage}`;

        // 이미지가 존재할 경우, 이메일에 첨부
        for (const user of users) {
            const email = user.email;
            const userId = user.user_id;

            // master 이메일을 가진 사용자 처리
            if (email === 'master') {
                console.error(`master skip:`, user);
                continue; // master 이메일을 가진 사용자는 알림 기록을 건너뛰기
            }

            // 이메일 알림 설정 확인
            const [settings] = await connection.execute('SELECT email_alert FROM Setting WHERE user_id = ?', [userId]);
            if (settings.length === 0 || !settings[0].email_alert) {
                console.log(`Email alerts 비활성화된 사용자:`, user);
                continue; // 이메일 알림이 비활성화된 경우 건너뛰기
            }

            // 이메일 발송
            try {
                const info = await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'AskMe',
                    text: message,
                    attachments: imagePath ? [{
                        filename: 'detected-image.jpg',  // 이미지 파일명
                        path: imagePath,  // 이미지 절대 경로
                    }] : [],
                });
                console.log(`Email sent to ${email}: ${info.response}`);

                // 이메일 발송 성공 시 기록
                await logNotification(connection, userId, alertId, 'email', message, 'success', imagePath);

            } catch (error) {
                console.error(`Error sending email to ${email}:`, error.message);

                // 이메일 발송 실패 시 기록
                await logNotification(connection, userId, alertId, 'email', message, 'failure', imagePath);
            }

            // SMS 발송
            try {
                await sendSms(user.phone_number, message);
                await logNotification(connection, userId, alertId, 'sms', message, 'success');
            } catch (error) {
                console.error(`Error sending SMS to ${user.phone_number}:`, error.message);
                await logNotification(connection, userId, alertId, 'sms', message, 'failure');
            }

            for (const user of users) {
                const userId = user.user_id;
            
                // 푸시 알림 설정 확인
                const [settings] = await connection.execute('SELECT push_alert FROM Setting WHERE user_id = ?', [userId]);
                if (settings.length === 0 || !settings[0].push_alert) {
                    console.log(`Push alerts 비활성화된 사용자:`, user);
                    continue; // 푸시 알림이 비활성화된 경우 건너뛰기
                }
            
                // OneSignal 알림 발송
                try {
                    const pushTitle = "흉기 탐지 알림";
                    const pushMessage = `${location || '알 수 없음'}에서 흉기 탐지 알림입니다. ${storeMessage}`;

                    // OneSignal에서 Android 전용 설정 추가
                    const androidOptions = {
                        small_icon: "ic_notification", // 리소스 아이콘 이름, 확장자 제외
                        android_accent_color: "08298A", // 16진수 색상 코드
                        large_icon: `https://postfiles.pstatic.net/MjAyNDExMTRfMTc2/MDAxNzMxNTQ3MzE2NTg4.T_IrKzpT4UHQPETMkmUs2EMVCWiYTAyshlIFOOO2LW0g.w7cgaa5Y_G7XGyiMasaR0UXq9wOzzX3rk3MjtjdjoJ4g.PNG/KakaoTalk_20241114_094837945_02.png?type=w580`,
                    };
                    const additionalData = { alertId, screen: "Alert" };
                    await sendPushNotification(userId, pushTitle, pushMessage, null, androidOptions, additionalData);
                    
            
                    // 푸쉬 알림 성공 기록
                    await logNotification(connection, userId, alertId, 'push', pushMessage, 'success', imagePath);
                } catch (error) {
                    console.error(`Error sending push notification to ${userId}:`, error.message);
            
                    // 푸쉬 알림 실패 기록
                    await logNotification(connection, userId, alertId, 'push', pushMessage, 'failure', imagePath);
                }
            }
            
            
        }

    } catch (error) {
        console.error('Error:', error);
    }
}


// 이메일이 example.com인지 확인
function isExampleEmail(email) {
    return email.endsWith('@example.com');
}

// 전화번호 유효성 검사 함수
function isValidPhoneNumber(phoneNumber) {
    const re = /^\+?[1-9]\d{1,14}$/; // E.164 형식에 맞는 전화번호 정규 표현식
    return re.test(String(phoneNumber)); // 전화번호가 유효한 경우 true 반환
}

// 이메일 유효성 검사 함수
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 간단한 이메일 정규 표현식
    return re.test(String(email).toLowerCase()) && email !== 'master'; // 'master' 제외
}

// sendTest(); // 테스트

module.exports = { sendTest };