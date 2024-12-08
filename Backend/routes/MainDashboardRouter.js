const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 전체 사용자 수 및 당일 사용자 수 가져오기
// 전체 사용자 수 및 당일 사용자 수 가져오기
router.get('/users', async (req, res) => {
    const totalUsersQuery = 'SELECT COUNT(*) AS total FROM Users';
    const dailyUsersQuery = "SELECT COUNT(*) AS daily FROM Users WHERE DATE(created_at) = CURDATE()";

    try {
        // 쿼리 실행
        const [totalUsers] = await db.executeQuery(totalUsersQuery);
        const [dailyUsers] = await db.executeQuery(dailyUsersQuery);

        console.log("Total Users Query Result:", totalUsers); // { total: 27 }
        console.log("Daily Users Query Result:", dailyUsers); // { daily: 0 }

        // 쿼리 결과에서 값을 가져옴
        const totalUserCount = totalUsers.total || 0;
        const dailyUserCount = dailyUsers.daily || 0;

        // 응답 전송
        res.json({
            totalUsers: totalUserCount,
            dailyUsers: dailyUserCount,
        });

        console.log("사용자 수를 성공적으로 가져왔습니다");
    } catch (err) {
        console.error('사용자 수를 가져오는 중 오류 발생:', err);
        return res.status(500).send('사용자 수를 가져오는 중 오류 발생');
    }
});


router.get('/admin/people-count/:year/:month/:day', async (req, res) => {
  const { year, month, day } = req.params;
  console.log( year, month, day,"잘 나오니???");
  
  const query = `
    SELECT 
      SUM(people_count_in) AS total_in,
      SUM(people_count_out) AS total_out
    FROM 
      CCTV_Person
    WHERE 
      YEAR(pedetection_time) = ?
      AND MONTH(pedetection_time) = ?
      AND DAY(pedetection_time) = ?;
  `;

  try {
    // MySQL 쿼리 실행 (async/await 사용)
    const rows = await db.executeQuery(query, [year, month, day]);

    // 결과가 없으면 기본값으로 설정
    const result = rows[0] || { total_in: 0, total_out: 0 };

    // 결과를 JSON 형식으로 반환
    res.json(result);
  } catch (error) {
    console.error('데이터베이스 쿼리 오류:', error);
    res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});


router.get('/people/:month', async (req, res) => {
  const month = req.params.month;
  console.log(month,"123");
  

  const query = `
    SELECT 
      HOUR(pedetection_time) AS hour,
      SUM(people_count_in) AS total_in,
      SUM(people_count_out) AS total_out
    FROM CCTV_Person
    WHERE MONTH(pedetection_time) = ?
    GROUP BY HOUR(pedetection_time)
    ORDER BY HOUR(pedetection_time);
  `;

  try {
    const rows = await db.executeQuery(query, [month]);
    console.log([rows],"사람2");

    // 항상 배열로 반환되도록 처리
    if (!Array.isArray(rows)) {
      res.json([rows]); // 단일 객체인 경우 배열로 감쌉니다.
      console.log(rows,"사람");

    } else {
      res.json(rows);
      console.log(rows,"사람1");

    }
  } catch (err) {
    console.error('데이터 조회 실패:', err);
    res.status(500).send('서버 오류');
  }
});

router.get('/weapons/:month', async (req, res) => {
  const month = req.params.month;

  const query = `
    SELECT 
      HOUR(Alert_Log.detection_time) AS hour,
      COUNT(*) AS weapon_count
    FROM Anomaly_Resolution
    JOIN Alert_Log ON Anomaly_Resolution.alert_id = Alert_Log.alert_id
    WHERE Anomaly_Resolution.anomaly_type = '흉기'
      AND MONTH(Alert_Log.detection_time) = ?
    GROUP BY HOUR(Alert_Log.detection_time)
    ORDER BY HOUR(Alert_Log.detection_time);
  `;

  try {
    const rows = await db.executeQuery(query, [month]);
    
    console.log(rows, "흉기3"); // 쿼리 결과 출력

    // 항상 배열로 반환되도록 처리
    if (!Array.isArray(rows)) {
      res.json([rows]); // 단일 객체인 경우 배열로 감쌉니다.
      console.log(rows, "흉기");
      
    } else {
      res.json(rows);
      console.log(rows, "흉기2");
    }


  } catch (err) {
    console.error('데이터 조회 실패:', err);
    res.status(500).send('서버 오류');
  }
});




// 월별 흉기 감지 및 오감지 데이터 조회 API
router.get('/one/Month', async (req, res) => {
  const query = `
    SELECT 
      months.month AS month,
      COALESCE(SUM(CASE WHEN anomaly_type = '흉기' THEN 1 ELSE 0 END), 0) AS weapon_count,
      COALESCE(SUM(CASE WHEN anomaly_type != '흉기' THEN 1 ELSE 0 END), 0) AS no_weapon_count
    FROM (
      SELECT 1 AS month UNION ALL
      SELECT 2 UNION ALL
      SELECT 3 UNION ALL
      SELECT 4 UNION ALL
      SELECT 5 UNION ALL
      SELECT 6 UNION ALL
      SELECT 7 UNION ALL
      SELECT 8 UNION ALL
      SELECT 9 UNION ALL
      SELECT 10 UNION ALL
      SELECT 11 UNION ALL
      SELECT 12
    ) AS months
    LEFT JOIN Anomaly_Resolution ar ON months.month = MONTH(ar.closed_at)
    AND ar.closed_at IS NOT NULL
    GROUP BY months.month
    ORDER BY months.month;
  `;

  try {
    const results = await db.executeQuery(query);
    console.log(results, "결과");
    res.json(results);
  } catch (err) {
    console.error('쿼리 실행 오류:', err);
    res.status(500).json({ error: '데이터 조회 실패' });
  }
});
  
  
  
  // 전체 알림 수 및 당일 알림 수 가져오기
  router.get('/notifications', async (req, res) => {
    const totalNotificationsQuery = 'SELECT COUNT(*) AS total FROM Anomaly_Resolution'; // 전체 알림 수를 가져오는 쿼리
    const dailyNotificationsQuery = "SELECT COUNT(*) AS daily FROM Anomaly_Resolution WHERE DATE(closed_at) = CURDATE()"; // 당일 알림 수를 가져오는 쿼리
  
    try {
      // 쿼리 실행
      const [totalNotifications] = await db.executeQuery(totalNotificationsQuery);
      const [dailyNotifications] = await db.executeQuery(dailyNotificationsQuery);
  
      // 로그 추가: 쿼리 결과 출력
      console.log('전체 감지 수:', totalNotifications);
      console.log('당일 감지 수:', dailyNotifications);
  
      // 결과가 존재하는지 확인하고 응답 전송
      res.json({
        totalNotifications: totalNotifications.total || 0, // 결과가 없으면 기본값 0 반환 (옵셔널 체이닝 사용)
        dailyNotifications: dailyNotifications.daily || 0, // 결과가 없으면 기본값 0 반환 (옵셔널 체이닝 사용)
      });
  
      console.log("감지 수를 성공적으로 가져왔습니다");
    } catch (err) {
      console.error('감지 수를 가져오는 중 오류 발생:', err);
      return res.status(500).send('감지 수를 가져오는 중 오류 발생');
    }
  });


  router.get('/usersgender', async (req, res) => {
    const query = 'SELECT role, gender, birth, created_at FROM Users';
    
    try {
      // 사용자 정의 executeQuery 함수 사용
      const results = await db.executeQuery(query);
      console.log(results, "나오니 차트");
      
      res.json(results); // 결과를 JSON으로 반환
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  router.get('/user-registration-stats', async (req, res) => {
    const query = `
        SELECT 
            created_at,
            role
        FROM Users
        WHERE role IN ('admin', 'guard', 'user')
        ORDER BY created_at;
    `;

    try {
        const results = await db.executeQuery(query);
        res.json(results); // 결과를 JSON으로 반환
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
module.exports = router;