// routes/reportRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 현재 시간 설정 (UTC 기준)
const created_at = new Date();

// 신고 생성 (Reports 테이블에 데이터 추가)
router.post("/reports", async (req, res) => {
    const { post_id, user_id, reason } = req.body;
 
    try {
        const result = await db.executeQuery(
            "INSERT INTO Reports (post_id, user_id, reason, created_at) VALUES (?, ?, ?, ?)",
            [post_id, user_id, reason, created_at]
        );
        res.status(201).json({ report_id: result.insertId, message: "신고가 접수되었습니다." });
    } catch (err) {
        console.error("Error details:", err); // 에러 로그 출력
        res.status(500).json({ error: "신고 접수 실패", details: err });
    }
});

// 신고 조회 (모든 신고 내역 조회 - 관리자 전용)
router.get("/reports", async (req, res) => {
    try {
        const reports = await db.executeQuery(`
            SELECT Reports.report_id, Reports.post_id, Reports.user_id, Reports.reason, Reports.created_at,
                   Posts.title AS post_title, Users.username AS reporter_name
            FROM Reports
            JOIN Posts ON Reports.post_id = Posts.post_id
            JOIN Users ON Reports.user_id = Users.user_id
            ORDER BY Reports.created_at DESC
        `);
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: "신고 내역 조회 실패", details: err });
    }
});

// 특정 신고 조회 (신고 ID로 조회)
router.get("/reports/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const report = await db.executeQuery(
            `SELECT Reports.report_id, Reports.post_id, Reports.user_id, Reports.reason, Reports.created_at,
                    Posts.title AS post_title, Users.username AS reporter_name
             FROM Reports
             JOIN Posts ON Reports.post_id = Posts.post_id
             JOIN Users ON Reports.user_id = Users.user_id
             WHERE Reports.report_id = ?`,
            [id]
        );
        if (report.length) res.status(200).json(report[0]);
        else res.status(404).json({ error: "해당 신고를 찾을 수 없습니다." });
    } catch (err) {
        res.status(500).json({ error: "신고 조회 실패", details: err });
    }
});

// 특정 게시글의 신고 내역 조회
router.get("/posts/:postId/reports", async (req, res) => {
    const { postId } = req.params;
    try {
        const reports = await db.executeQuery(
            `SELECT Reports.report_id, Reports.reason, Reports.created_at,
                    Users.username AS reporter_name
             FROM Reports
             JOIN Users ON Reports.user_id = Users.user_id
             WHERE Reports.post_id = ?
             ORDER BY Reports.created_at DESC`,
            [postId]
        );
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: "게시글의 신고 내역 조회 실패", details: err });
    }
});

/**
 * @swagger
 * /community/reports:
 *   post:
 *     summary: 신고 생성
 *     tags: [Community]
 *     description: 특정 게시글을 신고합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: 신고 접수 성공
 *       500:
 *         description: 신고 접수 실패
 */

/**
 * @swagger
 * /community/reports:
 *   get:
 *     summary: 모든 신고 조회 (관리자 전용)
 *     tags: [Community]
 *     description: 모든 신고 내역을 조회합니다.
 *     responses:
 *       200:
 *         description: 신고 목록
 *       500:
 *         description: 신고 조회 실패
 */

/**
 * @swagger
 * /community/reports/{id}:
 *   get:
 *     summary: 특정 신고 조회
 *     tags: [Community]
 *     description: 신고 ID를 통해 특정 신고 내역을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 신고 ID
 *     responses:
 *       200:
 *         description: 신고 상세 정보
 *       404:
 *         description: 해당 신고를 찾을 수 없음
 *       500:
 *         description: 신고 조회 실패
 */

/**
 * @swagger
 * /community/posts/{postId}/reports:
 *   get:
 *     summary: 특정 게시글의 신고 내역 조회
 *     tags: [Community]
 *     description: 특정 게시글에 대한 신고 내역을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 특정 게시글의 신고 내역
 *       500:
 *         description: 게시글의 신고 내역 조회 실패
 */

module.exports = router;
