// routes/mypageRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');

// 내 정보 조회
router.get('/info/:userId', async (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT username, mem_name, email, phone_number, gender, birth, nick FROM Users WHERE user_id = ?';

    try {
        const results = await db.executeQuery(query, [userId]);
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 알림 설정 조회
router.get('/settings/:userId', async (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM Setting WHERE user_id = ?';

    try {
        const results = await db.executeQuery(query, [userId]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Setting not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 알림 설정 생성 또는 업데이트
router.post('/settings/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { email_alert, sms_alert, push_alert } = req.body;

    try {
        // 설정이 이미 존재하는지 확인
        const existingSetting = await db.executeQuery('SELECT * FROM Setting WHERE user_id = ?', [userId]);

        if (existingSetting.length > 0) {
            // 기존 설정이 존재하면 업데이트
            await db.executeQuery(
                'UPDATE Setting SET email_alert = ?, sms_alert = ?, push_alert = ? WHERE user_id = ?',
                [email_alert, sms_alert, push_alert, userId]
            );
            res.json({ message: 'Settings updated successfully' });
        } else {
            // 설정이 없으면 새로 생성
            await db.executeQuery(
                'INSERT INTO Setting (user_id, email_alert, sms_alert, push_alert) VALUES (?, ?, ?, ?)',
                [userId, email_alert, sms_alert, push_alert]
            );
            res.json({ message: 'Settings created successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// 내가 작성한 글 조회
router.get('/posts/:userId', async (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT post_id, title, content FROM Posts WHERE user_id = ?';

    try {
        const results = await db.executeQuery(query, [userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 내가 작성한 댓글 조회
router.get('/comments/:userId', async (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT comment_id, content FROM Comments WHERE user_id = ?';

    try {
        const results = await db.executeQuery(query, [userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 내 정보 조회

/**
 * @swagger
 * tags:
 *   name: Mypage
 *   description: Mypage API
 */

/**
 * @swagger
 * /mypage/info/{userId}:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [Mypage]
 *     description: 사용자 ID로 내 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 mem_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 birth:
 *                   type: string
 *                 nick:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

// 알림 설정 조회
/**
 * @swagger
 * /mypage/settings/{userId}:
 *   get:
 *     summary: 알림 설정 조회
 *     tags: [Mypage]
 *     description: 사용자 ID로 알림 설정을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 알림 설정 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email_alert:
 *                   type: boolean
 *                 sms_alert:
 *                   type: boolean
 *                 push_alert:
 *                   type: boolean
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Internal server error
 */

// 알림 설정 생성 또는 업데이트
/**
 * @swagger
 * /mypage/settings/{userId}:
 *   post:
 *     summary: 알림 설정 생성 또는 업데이트
 *     tags: [Mypage]
 *     description: "사용자의 알림 설정을 생성하거나 기존 설정이 있는 경우 업데이트합니다."
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "사용자의 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_alert:
 *                 type: boolean
 *                 description: "이메일 알림 활성화 여부"
 *               sms_alert:
 *                 type: boolean
 *                 description: "SMS 알림 활성화 여부"
 *               push_alert:
 *                 type: boolean
 *                 description: "푸시 알림 활성화 여부"
 *             example:
 *               email_alert: true
 *               sms_alert: false
 *               push_alert: true
 *     responses:
 *       200:
 *         description: "Settings updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Settings updated successfully"
 *       201:
 *         description: "Settings created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Settings created successfully"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Internal server error"
 */

// 내가 작성한 글 조회
/**
 * @swagger
 * /mypage/posts/{userId}:
 *   get:
 *     summary: 내가 작성한 글 조회
 *     tags: [Mypage]
 *     description: 사용자 ID로 사용자가 작성한 글을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 내가 작성한 글 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   post_id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *       500:
 *         description: Internal server error
 */

// 내가 작성한 댓글 조회
/**
 * @swagger
 * /mypage/comments/{userId}:
 *   get:
 *     summary: 내가 작성한 댓글 조회
 *     tags: [Mypage]
 *     description: 사용자 ID로 사용자가 작성한 댓글을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 내가 작성한 댓글 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   comment_id:
 *                     type: integer
 *                   content:
 *                     type: string
 *       500:
 *         description: Internal server error
 */

module.exports = router;
