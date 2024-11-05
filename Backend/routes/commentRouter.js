// routes/communityRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');


// 현재 시간 설정 (UTC 기준)
const created_at = new Date(); // 현재 시간

// 댓글 관련 API
router.post("/comments", async (req, res) => {
  const { post_id, user_id, content } = req.body;

  try {
    // 포스트 ID가 존재하는지 확인
    const [post] = await db.executeQuery(
      "SELECT post_id FROM Posts WHERE post_id = ?",
      [post_id]
    );

    if (!post) {
      return res.status(404).json({ error: "해당 포스트를 찾을 수 없습니다." });
    }

    // 댓글을 데이터베이스에 추가
    const result = await db.executeQuery(
      "INSERT INTO Comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)",
      [post_id, user_id, content, new Date()] // created_at을 현재 시간으로 설정
    );

    // 추가한 댓글의 ID를 사용하여 닉네임을 가져옴 
    const [user] = await db.executeQuery(
      "SELECT nick FROM Users WHERE user_id = ?", 
      [user_id]
    );

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 응답에 댓글 ID와 닉네임 포함
    res.status(201).json({ 
      comment_id: result.insertId,
      nick: user.nick
    });
  } catch (err) {
    res.status(500).json({ 
      error: "댓글 생성 실패", 
      details: {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sql: err.sql,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
      }
    });
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
    Users.nick, 
    COUNT(CommentReports.report_id) AS report_count, 
    GROUP_CONCAT(DISTINCT ReportReasons.reason ORDER BY ReportReasons.reason ASC) AS reasons 
FROM Comments 
JOIN Users ON Comments.user_id = Users.user_id 
LEFT JOIN CommentReports ON Comments.comment_id = CommentReports.comment_id 
LEFT JOIN ReportReasons ON CommentReports.reason_id = ReportReasons.reason_id 
WHERE Comments.post_id = ?
GROUP BY Comments.comment_id, Users.username, Users.nick;
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
 *     description: 주어진 포스트에 댓글을 생성합니다.
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: integer
 *                 description: 댓글이 달릴 포스트의 ID입니다.
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 description: 댓글 작성자의 사용자 ID입니다.
 *                 example: 2
 *               content:
 *                 type: string
 *                 description: 댓글 내용입니다.
 *                 example: "이 포스트 정말 유익하네요!"
 *     responses:
 *       201:
 *         description: 댓글이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment_id:
 *                   type: integer
 *                   description: 생성된 댓글의 ID입니다.
 *                   example: 10
 *                 nick:
 *                   type: string
 *                   description: 댓글 작성자의 닉네임입니다.
 *                   example: "user123"
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "사용자를 찾을 수 없습니다."
 *       500:
 *         description: 댓글 생성 실패.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "댓글 생성 실패"
 *                 details:
 *                   type: string
 *                   example: "데이터베이스 오류"
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
