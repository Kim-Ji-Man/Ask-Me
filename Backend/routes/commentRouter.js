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
    const comments = await db.executeQuery("SELECT * FROM Comments WHERE post_id = ?", [postId]);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "댓글 조회 실패", details: err });
  }
});

module.exports = router;

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

module.exports = router;
