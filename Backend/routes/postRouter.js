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
    const { user_id, title, content } = req.body;
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
        const params = [user_id, title, content, imagePath, created_at]; 
        console.log("DB Params:", params);
        
        const result = await db.executeQuery(
            "INSERT INTO Posts (user_id, title, content, image, created_at) VALUES (?, ?, ?, ?, ?)",
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
    const posts = await db.executeQuery("SELECT * FROM Posts ORDER BY created_at DESC");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "게시글 조회 실패", details: err });
  }
});

// 3. 게시글 상세 조회 (ID로 조회)
router.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 조회수 증가
    await db.executeQuery("UPDATE Posts SET views = views + 1 WHERE post_id = ?", [id]);

    const post = await db.executeQuery("SELECT * FROM Posts WHERE post_id = ?", [id]);
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
  try {
    const result = await db.executeQuery(
      "UPDATE Posts SET title = ?, content = ?, image = ? WHERE post_id = ?",
      [title, content, image, id]
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
router.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.executeQuery("DELETE FROM Posts WHERE post_id = ?", [id]);
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
