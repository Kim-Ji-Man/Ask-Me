// routes/postRouter.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require("path");
const multer = require('multer');

const upload = multer({ dest: 'uploads/community' }); 

router.use(express.json({ limit: '50mb' })); // 이미지 데이터 처리 위한 크기 설정

// 게시글 관련 API
// 1. 게시글 생성
router.post("/posts", upload.single('image'), async (req, res) => {
  const { user_id, nick, title, content } = req.body; 
  const image = req.file; // multer가 업로드된 파일을 req.file에 저장합니다.
  
  console.log("Request Body:", req.body);
  
  let imagePath = null;
  if (image) {
      // 이미지 경로 설정: 상대 경로로 설정
      imagePath = path.join('uploads/community', image.filename); // 예: 'uploads/33726f2919090317f537da42b4490e2a'
  }

  // 현재 시간 설정 (UTC 기준)
  const created_at = new Date(); // 현재 시간

  // DB 쿼리 실행
  try {
      const params = [user_id, nick, title, content, imagePath, created_at]; // nick을 params에 추가합니다.
      console.log("DB Params:", params);
      
      const result = await db.executeQuery(
          "INSERT INTO Posts (user_id, nick, title, content, image, created_at) VALUES (?, ?, ?, ?, ?, ?)", // SQL 쿼리 수정
          params 
      );
      res.status(201).json({ post_id: result.insertId });
  } catch (err) {
      res.status(500).json({ error: "게시글 생성 실패", details: err.message });
  }
});


// 2. 게시글 조회 (모든 게시글 조회)
router.get("/posts", async (req, res) => {
  try {
    const posts = await db.executeQuery(`
SELECT 
    Posts.*, 
    Users.username,
    COUNT(DISTINCT Comments.comment_id) AS comment_count,
    (SELECT COUNT(report_id) FROM Reports WHERE Reports.post_id = Posts.post_id) AS report_count,
    GROUP_CONCAT(DISTINCT ReportReasons.reason ORDER BY ReportReasons.reason ASC) AS reasons,
    (SELECT COUNT(*) FROM Reports WHERE Reports.post_id = Posts.post_id AND Reports.reason_id = 1) AS reason_1_count,
    (SELECT COUNT(*) FROM Reports WHERE Reports.post_id = Posts.post_id AND Reports.reason_id = 2) AS reason_2_count,
    (SELECT COUNT(*) FROM Reports WHERE Reports.post_id = Posts.post_id AND Reports.reason_id = 3) AS reason_3_count,
    (SELECT COUNT(*) FROM Reports WHERE Reports.post_id = Posts.post_id AND Reports.reason_id = 4) AS reason_4_count,
    (SELECT COUNT(*) FROM Reports WHERE Reports.post_id = Posts.post_id AND Reports.reason_id = 5) AS reason_5_count
FROM Posts
LEFT JOIN Comments ON Posts.post_id = Comments.post_id
LEFT JOIN Reports ON Posts.post_id = Reports.post_id
LEFT JOIN ReportReasons ON Reports.reason_id = ReportReasons.reason_id
LEFT JOIN Users ON Posts.user_id = Users.user_id
GROUP BY Posts.post_id, Users.username
ORDER BY Posts.created_at DESC;
    `);
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "게시글 조회 실패", details: err });
  }
});

// 3. 게시글 상세 조회 (ID로 조회)
router.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id,"들어오니?");
  
  try {
    // 조회수 증가
    await db.executeQuery("UPDATE Posts SET views = views + 1 WHERE post_id = ?", [id]);

    const post = await db.executeQuery(`
        SELECT 
    Posts.*, 
    Users.username,
    COUNT(DISTINCT Comments.comment_id) AS comment_count,
    COUNT(DISTINCT Reports.report_id) AS report_count,
    GROUP_CONCAT(DISTINCT ReportReasons.reason ORDER BY ReportReasons.reason ASC) AS reasons
FROM Posts
LEFT JOIN Comments ON Posts.post_id = Comments.post_id
LEFT JOIN Reports ON Posts.post_id = Reports.post_id
LEFT JOIN ReportReasons ON Reports.reason_id = ReportReasons.reason_id
LEFT JOIN Users ON Posts.user_id = Users.user_id
WHERE Posts.post_id = ?
GROUP BY Posts.post_id, Users.username
ORDER BY Posts.created_at DESC;
      `, 
      [id]);
    if (post.length) {
      res.status(200).json(post[0]);
    } else {
      res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }
  } catch (err) {
    res.status(500).json({ error: "게시글 조회 실패", details: err });
  }
});

// 4. 게시글 수정
router.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const result = await db.executeQuery(
      "UPDATE Posts SET title = ?, content = ?, image = ? WHERE post_id = ?",
      [title, content, image || null, id]
    );
    
    if (result.affectedRows) {
      res.status(200).json({ message: "게시글이 수정되었습니다." });
    } else {
      res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }
  } catch (err) {
    res.status(500).json({ error: "게시글 수정 실패", details: err });
  }
});

// 5. 게시글 삭제
router.delete("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await db.executeQuery("DELETE FROM Posts WHERE post_id = ?", [postId]);
    if (result.affectedRows) {
      res.status(200).json({ message: "게시글이 삭제되었습니다." });
    } else {
      res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }
  } catch (err) {
    res.status(500).json({ error: "게시글 삭제 실패", details: err });
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
 * /community/posts:
 *   post:
 *     summary: 게시글 생성
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 4
 *               nick:
 *                 type: string
 *                 example: "닉네임"
 *               title:
 *                 type: string
 *                 example: "게시글 제목"
 *               content:
 *                 type: string
 *                 example: "게시글 내용"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "게시글에 첨부할 이미지 파일"
 *     responses:
 *       201:
 *         description: 게시글 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post_id:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: 게시글 생성 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "게시글 생성 실패"
 *                 details:
 *                   type: string
 *                   example: "에러 상세 메시지"
 */

/**
 * @swagger
 * /community/posts:
 *   get:
 *     summary: 모든 게시글 조회
 *     tags: [Community]
 *     description: 생성된 모든 게시글을 최신 순으로 조회합니다.
 *     responses:
 *       200:
 *         description: 게시글 목록
 *       500:
 *         description: 게시글 조회 실패
 */

/**
 * @swagger
 * /community/posts/{id}:
 *   get:
 *     summary: 특정 게시글 상세 조회
 *     tags: [Community]
 *     description: 게시글 ID를 통해 특정 게시글을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 상세 정보
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 게시글 조회 실패
 */

/**
 * @swagger
 * /community/posts/{id}:
 *   put:
 *     summary: 게시글 수정
 *     tags: [Community]
 *     description: 특정 게시글의 내용을 수정합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 게시글 수정 실패
 */

/**
 * @swagger
 * /community/posts/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Community]
 *     description: 특정 게시글을 삭제합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 삭제 성공
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 게시글 삭제 실패
 */

module.exports = router;
