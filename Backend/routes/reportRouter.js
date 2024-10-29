// routes/reportRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 게시글 신고 생성
router.post("/reports", async (req, res) => {
    const { post_id, user_id, reason_id } = req.body;
    const created_at = new Date(); // 현재 시간

    try {
        const result = await db.executeQuery(
            "INSERT INTO Reports (post_id, user_id, reason_id, created_at) VALUES (?, ?, ?, ?)",
            [post_id, user_id, reason_id, created_at]
        );
        res.status(201).json({ report_id: result.insertId, message: "신고가 접수되었습니다." });
    } catch (err) {
        console.error("Error details:", err); // 에러 로그 출력
        res.status(500).json({ error: "신고 접수 실패", details: err });
    }
});

// 댓글 신고 생성
router.post("/comment-reports", async (req, res) => {
    const { comment_id, user_id, reason_id } = req.body;
    const created_at = new Date(); // 현재 시간

    try {
        const result = await db.executeQuery(
            "INSERT INTO CommentReports (comment_id, user_id, reason_id, created_at) VALUES (?, ?, ?, ?)",
            [comment_id, user_id, reason_id, created_at]
        );
        res.status(201).json({ report_id: result.insertId, message: "댓글 신고가 접수되었습니다." });
    } catch (err) {
        console.error("Error details:", err); // 에러 로그 출력
        res.status(500).json({ error: "댓글 신고 접수 실패", details: err });
    }
});

// 모든 신고 내역 조회 (관리자 전용)
router.get("/reports", async (req, res) => {
    try {
        const reports = await db.executeQuery(`
            SELECT Reports.report_id, Reports.post_id, Reports.user_id, Reports.reason_id, Reports.created_at,
                   Posts.title AS post_title, Users.username AS reporter_name, ReportReasons.reason AS report_reason
            FROM Reports
            JOIN Posts ON Reports.post_id = Posts.post_id
            JOIN Users ON Reports.user_id = Users.user_id
            JOIN ReportReasons ON Reports.reason_id = ReportReasons.reason_id
            ORDER BY Reports.created_at DESC
        `);
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: "신고 내역 조회 실패", details: err });
    }
});

// 모든 댓글 신고 내역 조회 (관리자 전용)
router.get("/comment-reports", async (req, res) => {
    try {
        const reports = await db.executeQuery(`
            SELECT CommentReports.report_id, CommentReports.comment_id, CommentReports.user_id, CommentReports.reason_id, CommentReports.created_at,
                   Comments.content AS comment_content, Users.username AS reporter_name, ReportReasons.reason AS report_reason
            FROM CommentReports
            JOIN Comments ON CommentReports.comment_id = Comments.comment_id
            JOIN Users ON CommentReports.user_id = Users.user_id
            JOIN ReportReasons ON CommentReports.reason_id = ReportReasons.reason_id
            ORDER BY CommentReports.created_at DESC
        `);
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: "댓글 신고 내역 조회 실패", details: err });
    }
});

// 특정 신고 조회 (신고 ID로 조회)
router.get("/reports/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const report = await db.executeQuery(`
            SELECT Reports.report_id, Reports.post_id, Reports.user_id, Reports.reason_id, Reports.created_at,
                   Posts.title AS post_title, Users.username AS reporter_name, ReportReasons.reason AS report_reason
            FROM Reports
            JOIN Posts ON Reports.post_id = Posts.post_id
            JOIN Users ON Reports.user_id = Users.user_id
            JOIN ReportReasons ON Reports.reason_id = ReportReasons.reason_id
            WHERE Reports.report_id = ?`,
            [id]
        );
        if (report.length) res.status(200).json(report[0]);
        else res.status(404).json({ error: "해당 신고를 찾을 수 없습니다." });
    } catch (err) {
        res.status(500).json({ error: "신고 조회 실패", details: err });
    }
});

// 특정 댓글 신고 조회 (신고 ID로 조회)
router.get("/comment-reports/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const report = await db.executeQuery(`
            SELECT CommentReports.report_id, CommentReports.comment_id, CommentReports.user_id, CommentReports.reason_id, CommentReports.created_at,
                   Comments.content AS comment_content, Users.username AS reporter_name, ReportReasons.reason AS report_reason
            FROM CommentReports
            JOIN Comments ON CommentReports.comment_id = Comments.comment_id
            JOIN Users ON CommentReports.user_id = Users.user_id
            JOIN ReportReasons ON CommentReports.reason_id = ReportReasons.reason_id
            WHERE CommentReports.report_id = ?`,
            [id]
        );
        if (report.length) res.status(200).json(report[0]);
        else res.status(404).json({ error: "해당 댓글 신고를 찾을 수 없습니다." });
    } catch (err) {
        res.status(500).json({ error: "댓글 신고 조회 실패", details: err });
    }
});

// 특정 게시글의 신고 내역 조회
router.get("/posts/:postId/reports", async (req, res) => {
    const { postId } = req.params;
    try {
        const reports = await db.executeQuery(`
            SELECT Reports.report_id, Reports.reason_id, Reports.created_at,
                   Users.username AS reporter_name, ReportReasons.reason AS report_reason
            FROM Reports
            JOIN Users ON Reports.user_id = Users.user_id
            JOIN ReportReasons ON Reports.reason_id = ReportReasons.reason_id
            WHERE Reports.post_id = ?
            ORDER BY Reports.created_at DESC`,
            [postId]
        );
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: "게시글의 신고 내역 조회 실패", details: err });
    }
});

// 특정 댓글의 신고 내역 조회
router.get("/comments/:commentId/reports", async (req, res) => {
    const { commentId } = req.params;
    try {
        const reports = await db.executeQuery(`
            SELECT CommentReports.report_id, CommentReports.reason_id, CommentReports.created_at,
                   Users.username AS reporter_name, ReportReasons.reason AS report_reason
            FROM CommentReports
            JOIN Users ON CommentReports.user_id = Users.user_id
            JOIN ReportReasons ON CommentReports.reason_id = ReportReasons.reason_id
            WHERE CommentReports.comment_id = ?
            ORDER BY CommentReports.created_at DESC`,
            [commentId]
        );
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: "댓글의 신고 내역 조회 실패", details: err });
    }
});

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: 게시글 신고 관련 API
 */

/**
 * @swagger
 * /community/reports:
 *   post:
 *     tags: [Reports]
 *     summary: 게시글 신고 생성
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
 *               reason_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 신고가 접수되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: 신고 접수 실패
 */

/**
 * @swagger
 * /community/comment-reports:
 *   post:
 *     tags: [Reports]
 *     summary: 댓글 신고 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               reason_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 댓글 신고가 접수되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: 댓글 신고 접수 실패
 */

/**
 * @swagger
 * /community/reports:
 *   get:
 *     tags: [Reports]
 *     summary: 모든 신고 내역 조회 (관리자 전용)
 *     responses:
 *       200:
 *         description: 신고 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   report_id:
 *                     type: integer
 *                   post_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   reason_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   post_title:
 *                     type: string
 *                   reporter_name:
 *                     type: string
 *                   report_reason:
 *                     type: string
 *       500:
 *         description: 신고 내역 조회 실패
 */

/**
 * @swagger
 * /community/comment-reports:
 *   get:
 *     tags: [Reports]
 *     summary: 모든 댓글 신고 내역 조회 (관리자 전용)
 *     responses:
 *       200:
 *         description: 댓글 신고 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   report_id:
 *                     type: integer
 *                   comment_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   reason_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   comment_content:
 *                     type: string
 *                   reporter_name:
 *                     type: string
 *                   report_reason:
 *                     type: string
 *       500:
 *         description: 댓글 신고 내역 조회 실패
 */

/**
 * @swagger
 * /community/reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: 특정 신고 조회 (신고 ID로 조회)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 신고 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 신고 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: integer
 *                 post_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 reason_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 post_title:
 *                   type: string
 *                 reporter_name:
 *                   type: string
 *                 report_reason:
 *                   type: string
 *       404:
 *         description: 해당 신고를 찾을 수 없습니다.
 *       500:
 *         description: 신고 조회 실패
 */

/**
 * @swagger
 * /community/comment-reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: 특정 댓글 신고 조회 (신고 ID로 조회)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 댓글 신고 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 댓글 신고 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: integer
 *                 comment_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 reason_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 comment_content:
 *                   type: string
 *                 reporter_name:
 *                   type: string
 *                 report_reason:
 *                   type: string
 *       404:
 *         description: 해당 댓글 신고를 찾을 수 없습니다.
 *       500:
 *         description: 댓글 신고 조회 실패
 */

/**
 * @swagger
 * /community/posts/{postId}/reports:
 *   get:
 *     tags: [Reports]
 *     summary: 특정 게시글의 신고 내역 조회
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: 게시글 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 게시글의 신고 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   report_id:
 *                     type: integer
 *                   reason_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   reporter_name:
 *                     type: string
 *                   report_reason:
 *                     type: string
 *       500:
 *         description: 게시글의 신고 내역 조회 실패
 */

/**
 * @swagger
 * /community/comments/{commentId}/reports:
 *   get:
 *     tags: [Reports]
 *     summary: 특정 댓글의 신고 내역 조회
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: 댓글 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 댓글의 신고 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   report_id:
 *                     type: integer
 *                   reason_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   reporter_name:
 *                     type: string
 *                   report_reason:
 *                     type: string
 *       500:
 *         description: 댓글의 신고 내역 조회 실패
 */

module.exports = router;
