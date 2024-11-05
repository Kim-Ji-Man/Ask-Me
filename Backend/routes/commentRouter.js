// routes/communityRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');


// 현재 시간 설정 (UTC 기준)
const created_at = new Date(); // 현재 시간

// 댓글 관련 API
// 1. 댓글 생성
router.post("/comments", async (req, res) => {
  const { post_id, user_id, content } = req.body;

  try {
    const result = await db.executeQuery(
      "INSERT INTO Comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)",
      [post_id, user_id, content, created_at] 
    );
    res.status(201).json({ comment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "댓글 생성 실패", details: err });
  }
});


// 2. 특정 게시글의 모든 댓글 조회
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await db.executeQuery(`
        SELECT 
    Comments.*, 
    Users.username, 
    COUNT(CommentReports.report_id) AS report_count, 
    GROUP_CONCAT(DISTINCT ReportReasons.reason ORDER BY ReportReasons.reason ASC) AS reasons 
FROM Comments 
JOIN Users ON Comments.user_id = Users.user_id 
LEFT JOIN CommentReports ON Comments.comment_id = CommentReports.comment_id 
LEFT JOIN ReportReasons ON CommentReports.reason_id = ReportReasons.reason_id 
WHERE Comments.post_id = ?
GROUP BY Comments.comment_id, Users.username;
      `,
       [postId]);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "댓글 조회 실패", details: err });
  }
});


router.get("/posts/comments/all", async (req, res) => {
  try {
    const comments = await db.executeQuery(`
SELECT 
    Comments.*, 
    Users.username, 
    COUNT(CommentReports.report_id) AS report_count, 
    GROUP_CONCAT(DISTINCT ReportReasons.reason ORDER BY ReportReasons.reason ASC) AS reasons,
    (SELECT COUNT(*) FROM CommentReports WHERE CommentReports.comment_id = Comments.comment_id AND CommentReports.reason_id = 1) AS reason_1_count,
    (SELECT COUNT(*) FROM CommentReports WHERE CommentReports.comment_id = Comments.comment_id AND CommentReports.reason_id = 2) AS reason_2_count,
    (SELECT COUNT(*) FROM CommentReports WHERE CommentReports.comment_id = Comments.comment_id AND CommentReports.reason_id = 3) AS reason_3_count,
    (SELECT COUNT(*) FROM CommentReports WHERE CommentReports.comment_id = Comments.comment_id AND CommentReports.reason_id = 4) AS reason_4_count,
    (SELECT COUNT(*) FROM CommentReports WHERE CommentReports.comment_id = Comments.comment_id AND CommentReports.reason_id = 5) AS reason_5_count
FROM Comments 
JOIN Users ON Comments.user_id = Users.user_id 
LEFT JOIN CommentReports ON Comments.comment_id = CommentReports.comment_id 
LEFT JOIN ReportReasons ON CommentReports.reason_id = ReportReasons.reason_id 
GROUP BY Comments.comment_id, Users.username;
      `);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "댓글 조회 실패", details: err });
  }
});


router.delete('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  
  const sql = 'DELETE FROM Comments WHERE comment_id = ?';
  
  try {
    const results = await db.executeQuery(sql,[commentId]);
    res.send(results);
    console.log("댓글삭제 라우터");
} catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).send('Error fetching notifications');
}

});

/**
 * @swagger
 * tags:
 *   name: Community
 *   description: 커뮤니티 관련 API
 */

/**
 * @swagger
 * /community/comments:
 *   post:
 *     summary: 댓글 생성
 *     tags: [Community]
 *     description: 특정 게시글에 댓글을 추가합니다.
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 댓글이 성공적으로 추가되었습니다.
 *       500:
 *         description: 댓글 생성 실패
 */

/**
 * @swagger
 * /community/posts/{postId}/comments:
 *   get:
 *     summary: 특정 게시글의 모든 댓글 조회
 *     tags: [Community]
 *     description: 특정 게시글의 모든 댓글을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 댓글 목록
 *       500:
 *         description: 댓글 조회 실패
 */

/**
 * @swagger
 * /community/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a comment by its unique comment ID.
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affectedRows:
 *                   type: integer
 *                   description: Number of rows affected
 *       500:
 *         description: Server error
 */


module.exports = router;
