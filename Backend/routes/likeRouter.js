// routes/likeRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 현재 시간 설정 (UTC 기준)
const created_at = new Date(); // 현재 시간

// 좋아요 관련 API
// 1. 좋아요 추가
router.post("/likes/toggle", async (req, res) => {
  const { post_id, user_id } = req.body;

  try {
    // 먼저 해당 유저가 이미 좋아요를 눌렀는지 확인
    const [existingLike] = await db.executeQuery(
      "SELECT * FROM Likes WHERE post_id = ? AND user_id = ?",
      [post_id, user_id]
    );

    // 방어적 코드: existingLike가 undefined일 경우 빈 배열로 처리
    if (!existingLike || existingLike.length === 0) {
      // 좋아요 추가
      await db.executeQuery(
        "INSERT INTO Likes (post_id, user_id, created_at) VALUES (?, ?, NOW())",
        [post_id, user_id]
      );
      
      // Posts 테이블의 likes_count 증가
      await db.executeQuery("UPDATE Posts SET likes_count = likes_count + 1 WHERE post_id = ?", [post_id]);

      return res.status(201).json({ message: "좋아요가 추가되었습니다.", isLiked: true });
    } else {
      // 이미 좋아요가 존재하면 삭제
      await db.executeQuery(
        "DELETE FROM Likes WHERE post_id = ? AND user_id = ?",
        [post_id, user_id]
      );
      
      // Posts 테이블의 likes_count 감소
      await db.executeQuery("UPDATE Posts SET likes_count = likes_count - 1 WHERE post_id = ?", [post_id]);

      return res.status(200).json({ message: "좋아요가 삭제되었습니다.", isLiked: false });
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: "좋아요 상태 변경 실패", details: err });
  }
});


router.post('/likes/stat', async (req, res) => {
  const { post_id, user_id } = req.body;
  console.log("좋아요 상태 들어오니??",post_id);
  console.log("좋아요 상태 들어오니??",user_id);
  
  

  try {
    // 해당 유저가 해당 게시물에 좋아요를 눌렀는지 확인
    const [likeStatus] = await db.executeQuery(
      'SELECT COUNT(*) as isLiked FROM Likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );

    // 게시물의 총 좋아요 수 조회
    const [likeCount] = await db.executeQuery(
      'SELECT likes_count FROM Posts WHERE post_id = ?',
      [post_id]
    );

    res.status(200).json({
      isLiked: likeStatus.isLiked > 0, // 좋아요 여부 (0보다 크면 true)
      likeCount: likeCount.likes_count // 총 좋아요 수
    });
  } catch (err) {
    console.error('Error fetching like status:', err);
    res.status(500).json({ error: '좋아요 상태를 가져오는 데 실패했습니다.' });
  }
});

// 댓글 좋아요 추가

router.post("/comment-likes/toggle", async (req, res) => {
  const { comment_id, user_id } = req.body;

  try {
    // 먼저 사용자가 이미 해당 댓글에 좋아요를 눌렀는지 확인
    const [existingLike] = await db.executeQuery(
      "SELECT * FROM CommentLikes WHERE comment_id = ? AND user_id = ?",
      [comment_id, user_id]
    );

    if (!existingLike || existingLike.length === 0) {
      // 좋아요가 없는 경우 -> 새로 추가
      await db.executeQuery(
        "INSERT INTO CommentLikes (comment_id, user_id, created_at) VALUES (?, ?, NOW())",
        [comment_id, user_id]
      );

      // Comments 테이블의 likes_count 증가
      await db.executeQuery(
        "UPDATE Comments SET likes_count = likes_count + 1 WHERE comment_id = ?",
        [comment_id]
      );

      return res.status(201).json({ message: "댓글에 좋아요가 추가되었습니다.", isLiked: true });
    } else {
      // 이미 좋아요가 눌린 경우 -> 좋아요 삭제
      await db.executeQuery(
        "DELETE FROM CommentLikes WHERE comment_id = ? AND user_id = ?",
        [comment_id, user_id]
      );

      // Comments 테이블의 likes_count 감소
      await db.executeQuery(
        "UPDATE Comments SET likes_count = likes_count - 1 WHERE comment_id = ?",
        [comment_id]
      );

      return res.status(200).json({ message: "좋아요가 취소되었습니다.", isLiked: false });
    }
  } catch (err) {
    console.error("Error toggling comment like:", err);
    res.status(500).json({ error: "댓글 좋아요 처리 실패", details: err });
  }
});

router.post("/comment-likes/stat", async (req, res) => {
  const { post_id, user_id } = req.body;
  
  console.log(post_id, user_id); // 입력값 확인

  try {
    // post_id에 해당하는 모든 댓글의 좋아요 상태와 개수를 가져옴
    const commentsQuery = `
      SELECT c.comment_id, 
             c.likes_count, 
             CASE WHEN cl.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS isLiked
      FROM Comments c
      LEFT JOIN CommentLikes cl 
      ON c.comment_id = cl.comment_id AND cl.user_id = ?
      WHERE c.post_id = ?
    `;
    
    // 모든 댓글 정보를 가져옴
    const comments = await db.executeQuery(commentsQuery, [user_id, post_id]);

    // 쿼리 결과 로그 출력 (중요)
    console.log("쿼리 결과:", comments);

    // 쿼리 결과가 배열인지 확인하고 배열이면 그대로 응답
    if (Array.isArray(comments)) {
      res.status(200).json({ comments });
    } else {
      res.status(200).json({ comments: [comments] }); // 단일 객체일 경우 배열로 변환하여 응답
    }
  } catch (err) {
    console.error('Error fetching comment like status:', err);
    res.status(500).json({ error: "댓글 좋아요 상태 조회 실패", details: err });
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

/**
 * @swagger
 * /community/comment-likes:
 *   post:
 *     summary: 댓글 좋아요 추가
 *     description: 특정 댓글에 좋아요를 추가합니다.
 *     tags: [Comment Likes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment_id:
 *                 type: integer
 *                 description: 좋아요를 추가할 댓글 ID
 *               user_id:
 *                 type: integer
 *                 description: 좋아요를 추가한 사용자 ID
 *     responses:
 *       201:
 *         description: 댓글 좋아요가 추가되었습니다.
 *       500:
 *         description: 서버 오류로 인해 댓글 좋아요 추가 실패
 */

/**
 * @swagger
 * /community/comment-likes:
 *   delete:
 *     summary: 댓글 좋아요 삭제
 *     description: 특정 댓글에 추가된 좋아요를 삭제합니다.
 *     tags: [Comment Likes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment_id:
 *                 type: integer
 *                 description: 좋아요를 삭제할 댓글 ID
 *               user_id:
 *                 type: integer
 *                 description: 좋아요를 삭제한 사용자 ID
 *     responses:
 *       200:
 *         description: 댓글 좋아요가 삭제되었습니다.
 *       404:
 *         description: 해당 댓글 좋아요를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류로 인해 댓글 좋아요 삭제 실패
 */

module.exports = router;
