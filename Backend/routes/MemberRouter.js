const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
    const sql = 'SELECT * FROM Users';
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
    const sql = `DELETE FROM Users WHERE user_id=?`;

    try {
        const results = await db.executeQuery(sql,[memberSeq]); 
        res.send(results);
        console.log("회원삭제 완료");
    } catch (err) {
        console.error('Error fetching cameras:', err);
        return res.status(500).send('Error fetching cameras');
    }
  });








module.exports = router;
