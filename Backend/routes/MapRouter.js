const express = require('express');
const router = express.Router();
const db = require('../models/db');
router.get('/', async (req, res) => {
    const sql = `
        SELECT * FROM Near_by_Facilitie;
    `;
    
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
        console.log("지도 라우터");
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});

router.get('/alim', async (req, res) => {
    const sql = `
        SELECT 
    al.alert_id,
    al.detection_time,
    al.detected_weapon,
    al.level,
    s.latitude,
    s.longitude,
    s.name AS store_name
FROM 
    Alert_Log al
JOIN 
    Detection_Device d ON al.device_id = d.device_id
JOIN 
    Stores s ON d.store_id = s.store_id
WHERE 
    al.detected_weapon IS NOT NULL
ORDER BY 
    al.detection_time DESC;
    `;
    
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
        console.log("흉기알림지도 라우터");
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});

// 흉기 관련 이상 탐지 정보를 모두 가져오는 API
// 흉기 관련 알림 로그를 가져오는 API
router.get('/app/alim', async (req, res) => {
    try {
      // 1. Anomaly_Resolution 테이블에서 anomaly_type이 '흉기'인 alert_id 목록을 가져옴
      const anomalyResults = await db.executeQuery(`
        SELECT alert_id
        FROM Anomaly_Resolution
        WHERE anomaly_type = '흉기'
      `);
  
      console.log("Anomaly Results:", anomalyResults);
  
      // alert_id 목록 추출
      const alertIds = anomalyResults.map(anomaly => anomaly.alert_id);
  
      // 2. 각 alert_id에 대해 Alert_Log 및 관련 테이블에서 데이터를 조회
      const alertLogs = await Promise.all(
        alertIds.map(async (alertId) => {
          // Alert_Log 테이블에서 detection_time, device_id 조회
          const logData = await db.executeQuery(`
            SELECT detection_time, device_id,detected_weapon
            FROM Alert_Log
            WHERE alert_id = ?
          `, [alertId]);
  
          if (logData.length > 0) {
            const log = logData[0];
  
            // Detection_Device 테이블에서 store_id 조회
            const deviceData = await db.executeQuery(`
              SELECT store_id
              FROM Detection_Device
              WHERE device_id = ?
            `, [log.device_id]);
  
            if (deviceData.length > 0) {
              const storeId = deviceData[0].store_id;
  
              // Stores 테이블에서 address, latitude, longitude, name 조회
              const storeData = await db.executeQuery(`
                SELECT address, latitude, longitude, name
                FROM Stores
                WHERE store_id = ?
              `, [storeId]);
  
              if (storeData.length > 0) {
                const store = storeData[0];
  
                // 데이터 조합 후 반환 (detection_time, address, latitude, longitude, name 포함)
                return {
                  alert_id: alertId,
                  detection_time: log.detection_time,
                  detected_weapon :log.detected_weapon,
                  address: store.address,
                  latitude: store.latitude,
                  longitude: store.longitude,
                  store_name: store.name,
                };
              }
            }
          }
  
          // 데이터가 없으면 null 반환
          return null;
        })
      );
  
      // null이 아닌 데이터만 필터링하여 응답
      res.json(alertLogs.filter((data) => data !== null));
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      res.status(500).json({ message: '서버 에러 발생' });
    }
  });



module.exports = router;