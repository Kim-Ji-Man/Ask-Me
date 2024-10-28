// routes/likeRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 현재 시간 설정 (UTC 기준)
const created_at = new Date(); // 현재 시간

// 좋아요 관련 API
// 1. 좋아요 추가
router.post("/likes", async (req, res) => {
  const { post_id, user_id } = req.body;
  try {
    // 좋아요 추가
    await db.executeQuery("INSERT INTO Likes (post_id, user_id, created_at) VALUES (?, ?, ?)", [post_id, user_id, created_at]);
    
    // Posts 테이블의 likes_count 증가
    await db.executeQuery("UPDATE Posts SET likes_count = likes_count + 1 WHERE post_id = ?", [post_id]);
    
    res.status(201).json({ message: "좋아요가 추가되었습니다." });
  } catch (err) {
    res.status(500).json({ error: "좋아요 추가 실패", details: err });
  }
});

// 2. 좋아요 삭제
router.delete("/likes", async (req, res) => {
  const { post_id, user_id } = req.body;
  try {
    const result = await db.executeQuery("DELETE FROM Likes WHERE post_id = ? AND user_id = ?", [post_id, user_id]);
    if (result.affectedRows) {
      // Posts 테이블의 likes_count 감소
      await db.executeQuery("UPDATE Posts SET likes_count = likes_count - 1 WHERE post_id = ?", [post_id]);
      
      res.status(200).json({ message: "좋아요가 삭제되었습니다." });
    } else {
      res.status(404).json({ error: "좋아요를 찾을 수 없습니다." });
    }
  } catch (err) {
    res.status(500).json({ error: "좋아요 삭제 실패", details: err });
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
 * /community/likes:
 *   post:
 *     summary: 좋아요 추가
 *     tags: [Community]
 *     description: 특정 게시글에 좋아요를 추가합니다.
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
 *     responses:
 *       201:
 *         description: 좋아요 추가 성공
 *       500:
 *         description: 좋아요 추가 실패
 */

/**
 * @swagger
 * /community/likes:
 *   delete:
 *     summary: 좋아요 삭제
 *     tags: [Community]
 *     description: 특정 게시글의 좋아요를 삭제합니다.
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
 *     responses:
 *       200:
 *         description: 좋아요 삭제 성공
 *       404:
 *         description: 좋아요를 찾을 수 없음
 *       500:
 *         description: 좋아요 삭제 실패
 */

module.exports = router;
