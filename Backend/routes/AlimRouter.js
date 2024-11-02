const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { sendNotification } = require('../websockets'); // WebSocket 알림 전송 함수 임포트

let lastNotiId = null; // 마지막으로 처리한 noti_id를 저장

// 5초마다 새로운 알림 확인
setInterval(async () => {
    const sql = `
    SELECT 
        n.noti_id,
        n.alert_id,
        a.detection_time,
        a.level,
        d.device_name,
        n.noti_method,
        n.sent_at,
        n.message,
        n.image,
        n.status
    FROM 
        Notification n
    INNER JOIN 
        Alert_Log a ON n.alert_id = a.alert_id
    INNER JOIN 
        Detection_Device d ON a.device_id = d.device_id
    ORDER BY 
        n.noti_id DESC  
    LIMIT 1;
    `;

    try {
        const results = await db.executeQuery(sql);
        console.log("매장관리자 알림 감지중");
        
        // 새로운 알림이 있는지 확인 (마지막으로 처리한 noti_id와 비교)
        if (results.length > 0 && results[0].noti_id !== lastNotiId) {
            lastNotiId = results[0].noti_id; // 마지막으로 처리한 noti_id 업데이트
            sendNotification("새로운 알림이 도착했습니다!"); // 새로운 데이터가 있을 때만 WebSocket으로 알림 전송
            console.log("새로운 알림이 감지되었습니다.");
            console.log(lastNotiId, "마지막알림아이디");
        }
    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}, 60000); // 5초마다 확인

// 모든 알림 가져오기
router.get('/', async (req, res) => {
    const sql = `
    SELECT 
        n.noti_id, 
        n.user_id, 
        n.alert_id, 
        d.device_id, 
        d.device_name, 
        d.device_type, 
        d.location, 
        n.noti_method, 
        n.sent_at, 
        n.message, 
        n.image, 
        n.status
    FROM 
        Notification n
    JOIN 
        Alert_Log a ON n.alert_id = a.alert_id
    JOIN 
        Detection_Device d ON a.device_id = d.device_id
    ORDER BY 
        n.sent_at DESC;
    `;
    
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});

// 최근 5개의 알림 가져오기
router.get('/alertlist', async (req, res) => {
    const sql = `
    SELECT 
        n.noti_id,
        n.alert_id,
        a.detection_time,
        a.level,
        d.device_name,
        n.noti_method,
        n.sent_at,
        n.message,
        n.image,
        n.status
    FROM 
        Notification n
    INNER JOIN 
        Alert_Log a ON n.alert_id = a.alert_id
    INNER JOIN 
        Detection_Device d ON a.device_id = d.device_id
    ORDER BY 
        n.noti_id DESC  
         LIMIT 5;
    `;

    try {
        const results = await db.executeQuery(sql);
        res.send(results); // 클라이언트에 최신 5개의 알림 데이터를 반환
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});

module.exports = router;