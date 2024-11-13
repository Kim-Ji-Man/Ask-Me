const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // bcrypt 라이브러리
const db = require('../models/db');
const jwt = require('jsonwebtoken');
// const { sendMember } = require('../websockets'); // WebSocket 알림 전송 함수 임포트


// // 마지막으로 처리한 user_id를 저장할 변수
// let lastUserId = null;

// // 5초마다 새로운 사용자 확인
// setInterval(async () => {
//     const sql = `
//     SELECT 
//         user_id, mem_name,role, created_at 
//     FROM 
//         Users 
//     ORDER BY 
//         user_id DESC 
//     LIMIT 1;
//     `;

//     try {
//         const results = await db.executeQuery(sql);
//         console.log("시스템관리자 알림 감지중");
        
//         // 새로운 사용자가 있는지 확인 (마지막으로 처리한 user_id와 비교)
//         if (results.length > 0 && results[0].user_id !== lastUserId) {
//             lastUserId = results[0].user_id; // 마지막으로 처리한 user_id 업데이트
//             sendMember(`${results[0].mem_name}님이 회원가입하였습니다!`); // WebSocket 또는 다른 방법으로 알림 전송
//             console.log("새로운 사용자가 감지되었습니다:", results[0].mem_name);
//         }
//     } catch (err) {
//         console.error('Error fetching new users:', err);
//     }
// }, 5000); // 5초마다 확인

router.get('/', async (req, res) => {
    const sql = 'SELECT * FROM Users ORDER BY created_at DESC';
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
        console.log("회원관리 라우터");
    } catch (err) {
        console.error('Error fetching cameras:', err);
        return res.status(500).send('Error fetching cameras');
    }
    
});

router.post("/UpdateMember/:memberSeq", async (req, res) => {
    let memberSeq = req.params.memberSeq; 
    console.log("내정보 라우터:", memberSeq);
  
    const newEvent = req.body;
  
    let sql = `
        UPDATE Users
        SET username = ?,
            role = ?,
            gender = ?,
            phone_number = ?,
            account_status = ?
        WHERE user_id = ?;
    `; 
  
    const values = [
      newEvent.username,
      newEvent.role,
      newEvent.gender,
      newEvent.phone_number,
      newEvent.account_status,
      memberSeq 
    ];
    
    try {
        const results = await db.executeQuery(sql, values); 
        res.send(results);
        console.log("정보수정 완료");
    } catch (err) {
        console.error('Error fetching cameras:', err);
        return res.status(500).send('Error fetching cameras');
    }
});

router.delete('/Delete/:memberSeq', async (req, res) => {
    let memberSeq = req.params.memberSeq;
    console.log("딜리트 라우터:", memberSeq);
    
    const deleteGuardStoreSql = `DELETE FROM Guards_Stores WHERE user_id=?`;
    const deleteUserSql = `DELETE FROM Users WHERE user_id=?`;

    try {
        // 1. Guards_Stores 테이블에서 해당 사용자 삭제
        await db.executeQuery(deleteGuardStoreSql, [memberSeq]); 
        console.log("Guards_Stores에서 삭제 완료");

        // 2. Users 테이블에서 해당 사용자 삭제
        const results = await db.executeQuery(deleteUserSql, [memberSeq]); 
        res.send(results);
        console.log("회원삭제 완료");
    } catch (err) {
        console.error('회원 삭제 중 오류 발생:', err);
        return res.status(500).send('회원 삭제 중 오류 발생');
    }
});

  
router.get("/checkId/:mem_id", async (req, res) => {
    const mem_id = req.params.mem_id;
  
    let sql = "SELECT COUNT(*) AS count FROM Users WHERE username = ?";

    try {
        const results = await db.executeQuery(sql,[mem_id]); 
        res.send(results);
        console.log("아이디 중복검사 완료");
    } catch (err) {
        console.error('Error fetching cameras:', err);
        return res.status(500).send('Error fetching cameras');
    }
  });

  router.get('/guards/all/:store_id', async (req, res) => {
    const store_id = req.params.store_id
    console.log("되니?");
    const sql = `SELECT U.* FROM Users U JOIN Guards_Stores GS ON U.user_id = GS.user_id WHERE GS.store_id = ?`;
    try {
        const results = await db.executeQuery(sql,[store_id]); 
        res.send(results);

    } catch (err) {
        console.error('Error fetching cameras:', err);
        return res.status(500).send('Error fetching cameras');
    }

});

router.post('/VerifyPassword', async (req, res) => {
    console.log("들어오니??");
    const { password, token } = req.body;
    if (!token) {
        return res.status(400).json({ message: '토큰이 제공되지 않았습니다.' });
    }
    console.log('Token:', token); 
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        console.log(decoded,"들어오니???");
        
        const userId = decoded.userId;
        console.log(userId, "확인id");
        console.log('Executing query with user_id:', userId); // 쿼리 실행 전에 로그 추가
        const query = 'SELECT password FROM Users WHERE user_id = ?';
        const [rows] = await db.executeQuery(query, [userId]);
        console.log('Query result:', rows); // 쿼리 결과 확인
        // rows가 배열인지 확인
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        const hashedPassword = rows.password; // 해시된 비밀번호 가져오기 (단일 객체일 경우)
        // 입력된 비밀번호와 해시된 비밀번호 비교
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (isMatch) {
            return res.json({ isValid: true });
        } else {
            return res.json({ isValid: false });
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        }
        res.status(500).json({ message: '비밀번호 확인 중 오류가 발생했습니다.' });
    }
});


router.delete('/Master/Delete/:userId', async (req, res) => {
    const { userId } = req.params;
    const member_jic = req.body.member_jic; // 클라이언트에서 전달된 member_jic
    console.log(userId,"나오니? 번호");
    console.log(member_jic,"나오니? 직책");

    

    // SQL 쿼리 초기화
    let deleteUserSql, deleteGuardStoreSql, deleteStoresSql,deleteMasterAlertsSql;

    try {
        if (member_jic === 'guard') {
            // Guard 삭제 로직
            deleteUserSql = 'DELETE FROM Users WHERE user_id = ?';
            deleteGuardStoreSql = 'DELETE FROM Guards_Stores WHERE guard_id = ?';
            deleteMasterAlertsSql = 'DELETE FROM MasterAlerts WHERE user_id = ?'; 


            // 트랜잭션 시작
            await db.beginTransaction();
            await db.executeQuery(deleteMasterAlertsSql, [userId]); 
            console.log("MasterAlerts에서 삭제 완료");
            await db.executeQuery(deleteUserSql, [userId]);
            await db.executeQuery(deleteGuardStoreSql, [userId]);
            await db.commit();

            res.send({ message: 'Guard가 성공적으로 삭제되었습니다.' });
        } else if (member_jic === 'admin') {
            // Admin 삭제 로직
            deleteMasterAlertsSql = 'DELETE FROM MasterAlerts WHERE user_id = ?'; 
            deleteStoresSql = 'DELETE FROM Stores WHERE user_id = ?';  // 외래 키 참조된 레코드 먼저 삭제
            deleteUserSql = 'DELETE FROM Users WHERE user_id = ?';    // 그 다음 Users에서 삭제

            await db.executeQuery(deleteMasterAlertsSql, [userId]); 
            console.log("MasterAlerts에서 삭제 완료");

            // Stores 테이블에서 해당 사용자 삭제
            await db.executeQuery(deleteStoresSql, [userId]); 
            console.log("Stores에서 삭제 완료");

            // Users 테이블에서 해당 사용자 삭제
            await db.executeQuery(deleteUserSql, [userId]); 
            res.send({ message: 'Admin이 성공적으로 삭제되었습니다.' });
        } else {
            // 일반 사용자 삭제 로직
            deleteUserSql = 'DELETE FROM Users WHERE user_id = ?';
            deleteMasterAlertsSql = 'DELETE FROM MasterAlerts WHERE user_id = ?'; 
            
            await db.executeQuery(deleteMasterAlertsSql, [userId]); 
            console.log("MasterAlerts에서 삭제 완료");

            await db.executeQuery(deleteUserSql, [userId]);
            res.send({ message: 'User가 성공적으로 삭제되었습니다.' });
        }
    } catch (error) {
        // 오류 발생 시 롤백
        await db.rollback();
        console.error("삭제 중 오류 발생:", error);
        res.status(500).send({ error: '사용자 삭제 실패' });
    }
});

router.get('/push/:userId', async (req, res) => {
    const user_id = req.params.userId; // userId를 숫자로 변환
    console.log('Received user_id:', user_id); // user_id 값 확인
    
    const sql = `SELECT push_alert FROM Setting WHERE user_id = ?`;
    
    try {
      const [results] = await db.executeQuery(sql, [user_id]); // MySQL 쿼리 실행
        
      if (results) {
        res.send(results); // push_alert 값 반환
      } else {
        res.status(404).send({ error: '사용자를 찾을 수 없습니다.' });
      }
    } catch (err) {
      console.error('Error fetching push settings:', err);
      return res.status(500).send('Error fetching push settings');
    }
});

router.post('/push/update/:user_id', async (req, res) => {
    const user_id = req.params.user_id; // URL에서 user_id를 가져옴
    const { push_alert } = req.body; // POST 요청의 body에서 push_alert 값을 가져옴
    console.log(push_alert,user_id,"가져오니??");
    
  
    if (push_alert === undefined) { // 잘못된 조건 수정
      return res.status(400).send({ error: 'push_alert 값이 필요합니다.' });
    }
  
    const sql = `UPDATE Setting SET push_alert = ?, updated_at = NOW() WHERE user_id = ?`;
  
    try {
        const result = await db.executeQuery(sql, [push_alert, user_id]); // 구조 분해 할당 제거
        
        if (result && result.affectedRows > 0) {
          res.status(200).send({ message: '푸시 알림 설정이 성공적으로 업데이트되었습니다.' });
        } else {
          res.status(404).send({ error: '사용자를 찾을 수 없습니다.' });
        }
      } catch (err) {
        console.error('Error updating push settings:', err);
        return res.status(500).send('Error updating push settings');
      }
});



module.exports = router;