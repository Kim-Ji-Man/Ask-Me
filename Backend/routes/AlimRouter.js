const express = require("express");
const router = express.Router();
const db = require("../models/db");

const { sendNotification, broadcastAlertFlutter } = require("../websockets"); // WebSocket 알림 전송 함수 임포트
const { notifyUsers } = require("../onesignalService"); // WebSocket 알림 전송 함수 임포트
const moment = require("moment-timezone"); // moment-timezone 라이브러리 임포트

let lastNotiId = null; // 마지막으로 처리한 noti_id를 저장

const formatDetectionTime = (detectionTime) => {
  return moment(detectionTime).tz("Asia/Seoul").format("YYYY년 M월 D일 A h:mm");
};

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
    console.error("Error fetching notifications:", err);
  }
}, 60000); // 5초마다 확인



router.get('/app/Count/:role', async (req, res) => {
  const { role } = req.params;

  try {
    let totalQuery;
    let todayQuery;
    let params = [];

    // role이 'guard'인 경우 전체 카운트와 당일 카운트를 가져옴
    if (role === 'guard') {
      totalQuery = `
        SELECT COUNT(*) AS total_count 
        FROM Anomaly_Resolution;
      `;
      todayQuery = `
        SELECT COUNT(*) AS today_count 
        FROM Anomaly_Resolution 
        WHERE DATE(closed_at) = CURDATE();
      `;
    } 
    // role이 'user'인 경우 anomaly_type이 '흉기'인 것만 카운트
    else if (role === 'user') {
      totalQuery = `
        SELECT COUNT(*) AS total_count 
        FROM Anomaly_Resolution 
        WHERE anomaly_type = ?;
      `;
      todayQuery = `
        SELECT COUNT(*) AS today_count 
        FROM Anomaly_Resolution 
        WHERE anomaly_type = ? AND  DATE(closed_at) = CURDATE();
      `;
      params.push('흉기'); // anomaly_type이 '흉기'인 것만 필터링
    } 
    // 그 외의 경우는 에러 처리
    else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // 총 알림 수 쿼리 실행
    const totalRows = await db.executeQuery(totalQuery, params);
    console.log('Total Rows:', totalRows); // 디버깅용

    // 오늘 알림 수 쿼리 실행
    const todayRows = await db.executeQuery(todayQuery, params);
    console.log('Today Rows:', todayRows); // 디버깅용

    // 쿼리 결과가 배열로 반환되므로 첫 번째 요소에 접근해야 함
    if (totalRows.length > 0 && todayRows.length > 0) {
      res.json({
        total_count: totalRows[0].total_count,
        today_count: todayRows[0].today_count,
      });
    } else {
      console.log('No data found for the given role.');
      res.status(404).json({ error: "No data found" });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 모든 알림 가져오기
router.get("/", async (req, res) => {
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
        n.status,
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
    console.error("Error fetching notifications:", err);
    return res.status(500).send("Error fetching notifications");
  }
});

// 최근 5개의 알림 가져오기
router.get("/alertlist", async (req, res) => {
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
    console.error("Error fetching notifications:", err);
    return res.status(500).send("Error fetching notifications");
  }
});

router.get("/cctvalims", async (req, res) => {
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
    console.error("Error fetching anomalies:", err);
    res.status(500).json({ error: "Failed to fetch anomalies" });
  }
});

router.put("/update-anomaly/:id", async (req, res) => {
    const { id } = req.params; // URL에서 anomaly ID를 가져옴
    const { anomaly_type, admin_comment } = req.body; // 요청 본문에서 데이터 가져옴
  
    // 1. Anomaly_Resolution 업데이트 쿼리
    const updateQuery = `
        UPDATE Anomaly_Resolution 
        SET anomaly_type = ?, comment = ?
        WHERE id = ?;
      `;
  
    // 2. alert_id 조회 쿼리 (Anomaly_Resolution에서 alert_id 가져오기)
    const getAlertIdQuery = `
        SELECT alert_id FROM Anomaly_Resolution WHERE id = ?;
      `;
  
    // 3. 관련 데이터 조회 쿼리 (Alert_Log, Detection_Device, Stores 조인)
    const selectQuery = `
        SELECT 
            a.detection_time, 
            a.image_path, 
            d.store_id,
            s.name AS storeName
        FROM 
            Alert_Log a
        JOIN 
            Detection_Device d ON a.device_id = d.device_id
        JOIN 
            Stores s ON d.store_id = s.store_id
        WHERE 
            a.alert_id = ?;
      `;
  
    try {
      // 1. Anomaly_Resolution 업데이트 실행
      await db.executeQuery(updateQuery, [anomaly_type, admin_comment, id]);
  
      // 2. alert_id 조회 실행
      const alertIdResult = await db.executeQuery(getAlertIdQuery, [id]);
      
      if (alertIdResult.length === 0) {
        return res.status(404).json({ error: "No alert ID found for the given anomaly ID" });
      }
  
      const alertId = alertIdResult[0].alert_id; // alertId 추출
  
      // 3. 관련 데이터 조회 실행 (alertId 사용)
      const result = await db.executeQuery(selectQuery, [alertId]);
  
      if (result.length > 0) {
        const { detection_time, image_path, storeName } = result[0]; // 첫 번째 결과만 사용
  
        // anomaly_type이 '흉기'일 경우 플러터로 실시간 알림 및 푸시 알림 전송
        if (anomaly_type === "흉기") {
          console.log(`흉기 감지: ${storeName}, ${detection_time}`);
  
          const formattedTime = formatDetectionTime(detection_time);
  
          broadcastAlertFlutter(image_path, storeName, formattedTime,alertId);
  
          // 푸시 알림 전송 시 alertId 전달
          await notifyUsers(image_path, storeName, formattedTime, alertId);
        }
  
        res.status(200).json({ message: "Anomaly updated successfully", storeName });
      } else {
        res.status(404).json({ error: "No related data found" });
      }
    } catch (err) {
      console.error("Error updating anomaly or fetching related data:", err);
      res.status(500).json({ error: "Failed to update anomaly or fetch related data" });
    }
  });

router.get("/app/:userRole", async (req, res) => {
  const { userRole } = req.params;

  try {
    if (userRole === "guard") {
      // Original logic for 'guard' role
      const queryResult = await db.executeQuery(`
                SELECT detection_time, image_path, device_id
                FROM Alert_Log
            `);
      // console.log("queryResult:", queryResult);

      const alertLogs = Array.isArray(queryResult) ? queryResult : [];
      console.log("Alert Logs:", alertLogs);

      const result = await Promise.all(
        alertLogs.map(async (log) => {
          const deviceData = await db.executeQuery(
            `
                        SELECT store_id
                        FROM Detection_Device
                        WHERE device_id = ?
                    `,
            [log.device_id]
          );

          if (deviceData.length > 0) {
            const storeId = deviceData[0].store_id;

            const storeData = await db.executeQuery(
              `
                            SELECT address
                            FROM Stores
                            WHERE store_id = ?
                        `,
              [storeId]
            );

            return {
              detection_time: log.detection_time,
              image_path: log.image_path || "Default/Path/For/No/Image.jpg",
              address: storeData.length > 0 ? storeData[0].address : null,
            };
          }
          return null;
        })
      );

      res.json(result.filter((data) => data !== null));
    } else if (userRole === "user") {
      // New logic for 'user' role
      const anomalyResults = await db.executeQuery(`
                SELECT alert_id
                FROM Anomaly_Resolution
                WHERE anomaly_type = '흉기'
            `);
      console.log("Anomaly Results:", anomalyResults);

      const alertIds = anomalyResults.map((anomaly) => anomaly.alert_id);

      const alertLogs = await Promise.all(
        alertIds.map(async (alertId) => {
          const logData = await db.executeQuery(
            `
                        SELECT detection_time, image_path, device_id
                        FROM Alert_Log
                        WHERE alert_id = ?
                    `,
            [alertId]
          );

          if (logData.length > 0) {
            const log = logData[0];
            const deviceData = await db.executeQuery(
              `
                            SELECT store_id
                            FROM Detection_Device
                            WHERE device_id = ?
                        `,
              [log.device_id]
            );

            if (deviceData.length > 0) {
              const storeId = deviceData[0].store_id;

              const storeData = await db.executeQuery(
                `
                                SELECT address
                                FROM Stores
                                WHERE store_id = ?
                            `,
                [storeId]
              );

              return {
                detection_time: log.detection_time,
                image_path: log.image_path || "Default/Path/For/No/Image.jpg",
                address: storeData.length > 0 ? storeData[0].address : null,
              };
            }
          }
          return null;
        })
      );

      res.json(alertLogs.filter((data) => data !== null));
    } else {
      return res.status(403).json({ message: "권한이 없습니다." });
    }
  } catch (error) {
    console.error("데이터 조회 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/app/Home/:userRole", async (req, res) => {
  const { userRole } = req.params;

  try {
    if (userRole === "guard") {
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
          const deviceData = await db.executeQuery(
            `
                        SELECT store_id
                        FROM Detection_Device
                        WHERE device_id = ?
                    `,
            [log.device_id]
          );

          if (deviceData.length > 0) {
            const storeId = deviceData[0].store_id;

            const storeData = await db.executeQuery(
              `
                            SELECT address
                            FROM Stores
                            WHERE store_id = ?
                        `,
              [storeId]
            );

            return {
              detection_time: log.detection_time,
              image_path: log.image_path || "Default/Path/For/No/Image.jpg",
              address: storeData.length > 0 ? storeData[0].address : null,
            };
          }
          return null;
        })
      );

      res.json(result.filter((data) => data !== null));
    } else if (userRole === "user") {
      // 'user' 역할에 대한 쿼리: 최신순으로 4개만 가져옴
      const anomalyResults = await db.executeQuery(`
                SELECT alert_id
                FROM Anomaly_Resolution
                WHERE anomaly_type = '흉기'
                ORDER BY alert_id DESC
                LIMIT 4
            `);
      console.log("Anomaly Results:", anomalyResults);

      const alertIds = anomalyResults.map((anomaly) => anomaly.alert_id);

      const alertLogs = await Promise.all(
        alertIds.map(async (alertId) => {
          const logData = await db.executeQuery(
            `
                        SELECT detection_time, image_path, device_id
                        FROM Alert_Log
                        WHERE alert_id = ?
                    `,
            [alertId]
          );

          if (logData.length > 0) {
            const log = logData[0];
            const deviceData = await db.executeQuery(
              `
                            SELECT store_id
                            FROM Detection_Device
                            WHERE device_id = ?
                        `,
              [log.device_id]
            );

            if (deviceData.length > 0) {
              const storeId = deviceData[0].store_id;

              const storeData = await db.executeQuery(
                `
                                SELECT address
                                FROM Stores
                                WHERE store_id = ?
                            `,
                [storeId]
              );

              return {
                detection_time: log.detection_time,
                image_path: log.image_path || "Default/Path/For/No/Image.jpg",
                address: storeData.length > 0 ? storeData[0].address : null,
              };
            }
          }
          return null;
        })
      );

      res.json(alertLogs.filter((data) => data !== null));
    } else {
      return res.status(403).json({ message: "권한이 없습니다." });
    }
  } catch (error) {
    console.error("데이터 조회 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/MasterAlims", async (req, res) => {
  try {
    // '가입' 상태의 알림 데이터 조회
    const joinAlerts = await db.executeQuery(`
          SELECT 
            ma.master_alert_id, 
            ma.master_alert_content, 
            ma.created_at, 
            ma.status, 
            u.username AS user_name
          FROM MasterAlerts ma
          JOIN Users u ON ma.user_id = u.user_id
          WHERE ma.status = '가입'
        `);

    console.log("Join Alerts:", joinAlerts); // 디버깅용 로그

    // '신고' 상태의 알림 데이터 조회
    const reportAlerts = await db.executeQuery(`
        SELECT 
            ma.master_alert_id, 
            ma.master_alert_content, 
            ma.created_at, 
            ma.status, 
            u.username AS alert_user_name
        FROM MasterAlerts ma
        JOIN Users u ON ma.user_id = u.user_id
        WHERE ma.status = '신고';
                `);

    console.log("Report Alerts:", reportAlerts); // 디버깅용 로그

    // 두 결과를 합쳐서 클라이언트에 응답으로 전송
    const combinedResults = [...joinAlerts, ...reportAlerts];

    res.json(combinedResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("서버 오류");
  }
});

module.exports = router;
