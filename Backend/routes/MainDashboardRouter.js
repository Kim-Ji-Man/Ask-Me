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
  
  
  
  // 전체 알림 수 및 당일 알림 수 가져오기
  router.get('/notifications', async (req, res) => {
    const totalNotificationsQuery = 'SELECT COUNT(*) AS total FROM Notification'; // 전체 알림 수를 가져오는 쿼리
    const dailyNotificationsQuery = "SELECT COUNT(*) AS daily FROM Notification WHERE DATE(sent_at) = CURDATE()"; // 당일 알림 수를 가져오는 쿼리
  
    try {
      // 쿼리 실행
      const [totalNotifications] = await db.executeQuery(totalNotificationsQuery);
      const [dailyNotifications] = await db.executeQuery(dailyNotificationsQuery);
  
      // 로그 추가: 쿼리 결과 출력
      console.log('전체 알림 수:', totalNotifications);
      console.log('당일 알림 수:', dailyNotifications);
  
      // 결과가 존재하는지 확인하고 응답 전송
      res.json({
        totalNotifications: totalNotifications.total || 0, // 결과가 없으면 기본값 0 반환 (옵셔널 체이닝 사용)
        dailyNotifications: dailyNotifications.daily || 0, // 결과가 없으면 기본값 0 반환 (옵셔널 체이닝 사용)
      });
  
      console.log("알림 수를 성공적으로 가져왔습니다");
    } catch (err) {
      console.error('알림 수를 가져오는 중 오류 발생:', err);
      return res.status(500).send('알림 수를 가져오는 중 오류 발생');
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