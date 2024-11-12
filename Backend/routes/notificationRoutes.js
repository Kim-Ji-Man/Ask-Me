require('dotenv').config({ path: '../.env' });
const db = require('../config/dbConfig');

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// SMS 발송 함수
async function sendSms(phoneNumber, message) {
    try {
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

// 이메일이 example.com인지 확인
function isExampleEmail(email) {
    return email.endsWith('@example.com');
}

// 전화번호 유효성 검사 함수
function isValidPhoneNumber(phoneNumber) {
    const re = /^\+?[1-9]\d{1,14}$/; // E.164 형식에 맞는 전화번호 정규 표현식
    return re.test(String(phoneNumber)); // 전화번호가 유효한 경우 true 반환
}

// 이메일 발송 및 기록
async function sendTestEmail() {
    try {
        // 데이터베이스 연결
        const connection = await db.getConnection();
        console.log('success');

        // 수신자 이메일, 전화번호 가져오기 (Users 테이블에서)
        const [users] = await connection.execute('SELECT user_id, email, phone_number FROM Users WHERE email IS NOT NULL');
        console.log('Users retrieved:', users);

        // Alert_Log에서 가장 최근 alert_id 가져오기
        const [alerts] = await connection.execute('SELECT alert_id FROM Alert_Log ORDER BY created_at DESC LIMIT 1');
        const alertId = alerts.length > 0 ? alerts[0].alert_id : null;

        if (!alertId) {
            console.error('No alert_id found in Alert_Log.');
            return;
        }

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

            // SMS 알림 설정 확인
            const [smsSettings] = await connection.execute('SELECT sms_alert FROM Setting WHERE user_id = ?', [userId]);
            if (smsSettings.length === 0 || !smsSettings[0].sms_alert) {
                console.log(`SMS alerts 비활성화된 사용자:`, user);
                continue; // SMS 알림이 비활성화된 경우 건너뛰기
            }

            // 이메일 유효성 검사
            if (!email || !isValidEmail(email) || isExampleEmail(email)) {
                console.error(`유효한 Email 주소가 아닌 사용자:`, user);
                await logNotification(connection, userId, alertId, 'email', 'Failed', 'failure');
                continue; // 유효하지 않으면 다음 사용자로 넘어가기
            }


            const message = '흉기 탐지 알림.';
                
            // 이메일 발송
            try {
                const info = await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'AskMe',
                    text: message,
                });
                console.log(`Email sent to ${email}: ${info.response}`);

                // 이메일 발송 성공 시 기록
                await logNotification(connection, userId, alertId, 'email', message, 'success');

            } catch (error) {
                console.error(`Error sending email to ${email}:`, error.message);

                // 이메일 발송 실패 시 기록
                // await logNotification(connection, userId, alertId, 'email', message, 'failure');
            }

             // SMS 발송 전 전화번호 유효성 검사
             if (!isValidPhoneNumber(user.phone_number)) {
                console.error(`유효하지 않은 전화번호: ${user.phone_number}`);
                await logNotification(connection, userId, alertId, 'sms', '유효하지 않은 전화번호', 'failure');
                continue; // 유효하지 않은 전화번호인 경우 SMS 발송을 건너뜀
            }

            // SMS 발송
            try {
                await sendSms(user.phone_number, message);
                await logNotification(connection, userId, alertId, 'sms', message, 'success');
            } catch (error) {
                console.error(`Error sending SMS to ${user.phone_number}:`, error.message);
                await logNotification(connection, userId, alertId, 'sms', message, 'failure');
            }

        }

    } catch (error) {
    console.error('Error:', error);
    }   
}

// 이메일 유효성 검사 함수
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 간단한 이메일 정규 표현식
    return re.test(String(email).toLowerCase()) && email !== 'master'; // 'master' 제외
}

module.exports = { sendTestEmail };