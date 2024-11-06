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


router.get('/cctvalims', async (req, res) => {
    const query = `
      SELECT 
          ar.id,
          ar.device_id,
          dd.device_name,
          dd.location,
          ar.anomaly_type,
          ar.comment,
          ar.closed_at,
          al.detection_time,
          al.image_path
      FROM 
          Anomaly_Resolution ar
      JOIN 
          Detection_Device dd ON ar.device_id = dd.device_id
      JOIN 
          Alert_Log al ON ar.alert_id = al.alert_id;
    `;
    
    try {
      const results = await db.executeQuery(query);
      res.json(results); // 결과를 JSON으로 반환
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });


  router.put('/update-anomaly/:id', async (req, res) => {
    const { id } = req.params; // URL에서 anomaly ID를 가져옴
    const { anomaly_type, admin_comment } = req.body; // 요청 본문에서 데이터 가져옴
  
    const query = `
      UPDATE Anomaly_Resolution 
      SET anomaly_type = ?, comment = ?
      WHERE id = ?;
    `;
  
    try {
      // 데이터베이스 업데이트 실행
      await db.executeQuery(query, [anomaly_type, admin_comment, id]);
      res.status(200).json({ message: 'Anomaly updated successfully' });
    } catch (err) {
      console.error('Error updating anomaly:', err);
      res.status(500).json({ error: 'Failed to update anomaly' });
    }
  });


  router.get('/app/:userRole', async (req, res) => {
    const { userRole } = req.params;

    try {
        if (userRole === 'guard') {
            // Original logic for 'guard' role
            const queryResult = await db.executeQuery(`
                SELECT detection_time, image_path, device_id
                FROM Alert_Log
            `);
            console.log("queryResult:", queryResult);

            const alertLogs = Array.isArray(queryResult) ? queryResult : [];
            console.log("Alert Logs:", alertLogs);

            const result = await Promise.all(
                alertLogs.map(async (log) => {
                    const deviceData = await db.executeQuery(`
                        SELECT store_id
                        FROM Detection_Device
                        WHERE device_id = ?
                    `, [log.device_id]);

                    if (deviceData.length > 0) {
                        const storeId = deviceData[0].store_id;

                        const storeData = await db.executeQuery(`
                            SELECT address
                            FROM Stores
                            WHERE store_id = ?
                        `, [storeId]);

                        return {
                            detection_time: log.detection_time,
                            image_path: log.image_path || 'Default/Path/For/No/Image.jpg',
                            address: storeData.length > 0 ? storeData[0].address : null,
                        };
                    }
                    return null;
                })
            );

            res.json(result.filter((data) => data !== null));

        } else if (userRole === 'user') {
            // New logic for 'user' role
            const anomalyResults = await db.executeQuery(`
                SELECT alert_id
                FROM Anomaly_Resolution
                WHERE anomaly_type = '흉기'
            `);
            console.log("Anomaly Results:", anomalyResults);

            const alertIds = anomalyResults.map(anomaly => anomaly.alert_id);

            const alertLogs = await Promise.all(
                alertIds.map(async (alertId) => {
                    const logData = await db.executeQuery(`
                        SELECT detection_time, image_path, device_id
                        FROM Alert_Log
                        WHERE alert_id = ?
                    `, [alertId]);

                    if (logData.length > 0) {
                        const log = logData[0];
                        const deviceData = await db.executeQuery(`
                            SELECT store_id
                            FROM Detection_Device
                            WHERE device_id = ?
                        `, [log.device_id]);

                        if (deviceData.length > 0) {
                            const storeId = deviceData[0].store_id;

                            const storeData = await db.executeQuery(`
                                SELECT address
                                FROM Stores
                                WHERE store_id = ?
                            `, [storeId]);

                            return {
                                detection_time: log.detection_time,
                                image_path: log.image_path || 'Default/Path/For/No/Image.jpg',
                                address: storeData.length > 0 ? storeData[0].address : null,
                            };
                        }
                    }
                    return null;
                })
            );

            res.json(alertLogs.filter((data) => data !== null));

        } else {
            return res.status(403).json({ message: '권한이 없습니다.' });
        }

    } catch (error) {
        console.error('데이터 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


router.get('/app/Home/:userRole', async (req, res) => {
    const { userRole } = req.params;

    try {
        if (userRole === 'guard') {
            // 'guard' 역할에 대한 쿼리: 최신순으로 4개만 가져옴
            const queryResult = await db.executeQuery(`
                SELECT detection_time, image_path, device_id
                FROM Alert_Log
                ORDER BY detection_time DESC
                LIMIT 4
            `);
            console.log("queryResult:", queryResult);

            const alertLogs = Array.isArray(queryResult) ? queryResult : [];
            console.log("Alert Logs:", alertLogs);

            const result = await Promise.all(
                alertLogs.map(async (log) => {
                    const deviceData = await db.executeQuery(`
                        SELECT store_id
                        FROM Detection_Device
                        WHERE device_id = ?
                    `, [log.device_id]);

                    if (deviceData.length > 0) {
                        const storeId = deviceData[0].store_id;

                        const storeData = await db.executeQuery(`
                            SELECT address
                            FROM Stores
                            WHERE store_id = ?
                        `, [storeId]);

                        return {
                            detection_time: log.detection_time,
                            image_path: log.image_path || 'Default/Path/For/No/Image.jpg',
                            address: storeData.length > 0 ? storeData[0].address : null,
                        };
                    }
                    return null;
                })
            );

            res.json(result.filter((data) => data !== null));

        } else if (userRole === 'user') {
            // 'user' 역할에 대한 쿼리: 최신순으로 4개만 가져옴
            const anomalyResults = await db.executeQuery(`
                SELECT alert_id
                FROM Anomaly_Resolution
                WHERE anomaly_type = '흉기'
                ORDER BY alert_id DESC
                LIMIT 4
            `);
            console.log("Anomaly Results:", anomalyResults);

            const alertIds = anomalyResults.map(anomaly => anomaly.alert_id);

            const alertLogs = await Promise.all(
                alertIds.map(async (alertId) => {
                    const logData = await db.executeQuery(`
                        SELECT detection_time, image_path, device_id
                        FROM Alert_Log
                        WHERE alert_id = ?
                    `, [alertId]);

                    if (logData.length > 0) {
                        const log = logData[0];
                        const deviceData = await db.executeQuery(`
                            SELECT store_id
                            FROM Detection_Device
                            WHERE device_id = ?
                        `, [log.device_id]);

                        if (deviceData.length > 0) {
                            const storeId = deviceData[0].store_id;

                            const storeData = await db.executeQuery(`
                                SELECT address
                                FROM Stores
                                WHERE store_id = ?
                            `, [storeId]);

                            return {
                                detection_time: log.detection_time,
                                image_path: log.image_path || 'Default/Path/For/No/Image.jpg',
                                address: storeData.length > 0 ? storeData[0].address : null,
                            };
                        }
                    }
                    return null;
                })
            );

            res.json(alertLogs.filter((data) => data !== null));

        } else {
            return res.status(403).json({ message: '권한이 없습니다.' });
        }

    } catch (error) {
        console.error('데이터 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
  

module.exports = router;