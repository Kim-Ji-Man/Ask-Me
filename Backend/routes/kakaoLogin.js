// routes/kakaoLogin.js
const express = require('express');
const router = express.Router();
const { kakaoLogin } = require('../controllers/kakaoAuth');

// 카카오 로그인 엔드포인트
/**
 * @swagger
 * /auth/kakao:
 *   post:
 *     summary: Kakao 로그인
 *     description: 카카오 계정을 사용하여 로그인합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: 카카오 인증 코드
 *     responses:
 *       200:
 *         description: 성공적으로 로그인됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 userInfo:
 *                   type: object
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/', kakaoLogin); // POST 요청 처리

module.exports = router;
