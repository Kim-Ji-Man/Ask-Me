const express = require('express');
const router = express.Router();
const db = require('../models/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * /find/id:
 *   post:
 *     summary: 아이디 찾기
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mem_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공적으로 아이디를 찾았습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 일치하는 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 데이터베이스 오류
 */

// 아이디 찾기 API
router.post('/id', async (req, res) => {
    const { mem_name, phone_number } = req.body;

    if (!mem_name || !phone_number) {
        return res.status(400).json({ message: '이름과 휴대폰 번호를 입력해주세요.' });
    }

    // 이름과 휴대폰 번호로 사용자 조회
    const query = 'SELECT username FROM Users WHERE mem_name = ? AND phone_number = ?';
    try {
        const results = await db.executeQuery(query, [mem_name, phone_number]);
        if (results.length > 0) {
            return res.status(200).json({ username: results[0].username });
        } else {
            return res.status(404).json({ message: '일치하는 사용자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        return res.status(500).json({ message: '데이터베이스 오류' });
    }
});

/**
 * @swagger
 * /find/password:
 *   post:
 *     summary: Request temporary password
 *     tags: [Users]
 *     description: Generate and return a temporary password if username and phone number match.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - phone_number
 *             properties:
 *               username:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Temporary password is generated and returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tempPassword:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */

// 비밀번호 재설정 API
router.post('/password', async (req, res) => {
    const { username, phone_number } = req.body;

    if (!username || !phone_number) {
        return res.status(400).json({ message: '아이디와 휴대폰 번호를 입력해주세요.' });
    }

    const query = 'SELECT * FROM Users WHERE username = ? AND phone_number = ?';
    try {
        const results = await db.executeQuery(query, [username, phone_number]);

        if (results.length > 0) {
            const user = results[0];
            
            // 임시 비밀번호 생성
            const tempPassword = crypto.randomBytes(6).toString('hex');  // 임시 비밀번호 (길이 6)
            
            // 비밀번호 해시화 (bcrypt로 처리)
            const hashedPassword = await bcrypt.hash(tempPassword, 10);  // 솔트 값 10
            
            // 임시 비밀번호를 DB에 저장
            const updateQuery = 'UPDATE Users SET password = ? WHERE username = ?';
            await db.executeQuery(updateQuery, [hashedPassword, username]);

            return res.status(200).json({ message: '임시 비밀번호가 발급되었습니다.', tempPassword: tempPassword });
        } else {
            return res.status(404).json({ message: '일치하는 사용자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        return res.status(500).json({ message: '데이터베이스 오류' });
    }
});


module.exports = router;
