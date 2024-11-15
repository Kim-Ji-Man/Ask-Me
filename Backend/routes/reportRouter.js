// routes/reportRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 게시글 신고 생성
// 게시글 신고 추가
router.post("/reports", async (req, res) => {
    const { post_id, user_id, reason_ids } = req.body; // reason_ids는 배열로 받음
    const created_at = new Date(); // 현재 시간

    try {
        // 여러 개의 reason_id 처리
        for (const reason_id of reason_ids) {
            await db.executeQuery(
                "INSERT INTO Reports (post_id, user_id, reason_id, created_at) VALUES (?, ?, ?, ?)",
                [post_id, user_id, reason_id, created_at]
            );
        }

        res.status(201).json({ message: "신고가 접수되었습니다." });
    } catch (err) {
        console.error("Error details:", err); // 에러 로그 출력
        res.status(500).json({ error: "신고 접수 실패", details: err });
    }
});

// 게시글 신고 상태 확인
router.post("/reports/status", async (req, res) => {
    const { post_id, user_id } = req.body;

    try {
        // 해당 유저가 해당 게시물을 신고했는지 확인 (중복된 신고 제거)
        const [existingReport] = await db.executeQuery(
            "SELECT COUNT(DISTINCT user_id) as reportCount FROM Reports WHERE post_id = ? AND user_id = ?",
            [post_id, user_id]
        );

        // 방어적 코드: existingReport가 undefined일 경우 처리
        if (!existingReport || existingReport.length === 0) {
            return res.status(200).json({ isReported: false });
        }

        const reportCount = existingReport.reportCount || 0; // 배열이 아닌 객체로 처리

        if (reportCount > 0) {
            return res.status(200).json({ isReported: true, reportCount: reportCount });
        } else {
            return res.status(200).json({ isReported: false });
        }
    } catch (err) {
        console.error("Error fetching report status:", err);
        res.status(500).json({ error: "신고 상태를 가져오는 데 실패했습니다.", details: err });
    }
});

router.post("/comment-reports/comment", async (req, res) => {
    const { comment_id, user_id, reason_ids } = req.body;
    const created_at = new Date(); // 현재 시간

    try {
        // Check if the user has already reported this comment
        const [existingReport] = await db.executeQuery(
            "SELECT COUNT(*) AS count FROM CommentReports WHERE comment_id = ? AND user_id = ?",
            [comment_id, user_id]
        );

        if (existingReport.count > 0) {
            // User has already reported this comment
            return res.status(403).json({ message: "You have already reported this comment." });
        }

        // Insert new report for each reason_id
        for (const reason_id of reason_ids) {
            await db.executeQuery(
                "INSERT INTO CommentReports (comment_id, user_id, reason_id, created_at) VALUES (?, ?, ?, ?)",
                [comment_id, user_id, reason_id, created_at]
            );
        }

        // Calculate the total report count for the comment (distinct by user)
        const [reportCountResult] = await db.executeQuery(
            "SELECT COUNT(DISTINCT user_id) AS reportCount FROM CommentReports WHERE comment_id = ?",
            [comment_id]
        );
        const reportCount = reportCountResult.reportCount;

        res.status(201).json({ message: "Report has been submitted successfully.", reportCount });
    } catch (err) {
        console.error("Error details:", err);
        res.status(500).json({ error: "Failed to submit report", details: err });
    }
});

router.post('/comment-reports/status', async (req, res) => {
    const { comment_id, user_id } = req.body;

    try {
        // 1. 해당 사용자가 이 댓글을 이미 신고했는지 확인
        const [existingReport] = await db.executeQuery(
            "SELECT COUNT(*) AS count FROM CommentReports WHERE comment_id = ? AND user_id = ?",
            [comment_id, user_id]
        );

        // 2. 해당 댓글의 전체 신고 횟수 계산 (distinct by user)
        const [reportCountResult] = await db.executeQuery(
            "SELECT COUNT(DISTINCT user_id) AS reportCount FROM CommentReports WHERE comment_id = ?",
            [comment_id]
        );
        const reportCount = reportCountResult.reportCount;

        // 3. 클라이언트에게 응답 전송
        res.status(200).json({
            isReported: existingReport.count > 0, // 사용자가 이미 신고했는지 여부
            reportCount: reportCount // 해당 댓글의 총 신고 횟수 (중복 제거)
        });
    } catch (err) {
        console.error("Error fetching report status:", err);
        res.status(500).json({ error: "Failed to fetch report status" });
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
