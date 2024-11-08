const express = require('express');
const router = express.Router();
const db = require('../models/db');

/**
 * @swagger
 * /stores/names:
 *   get:
 *     summary: 모든 매장명 조회
 *     description: Fetches an array of store names from the database.
 *     tags:
 *       - Stores
 *     responses:
 *       200:
 *         description: 모든 매장명 조회
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Store Name"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching store names"
 */

// 모든 매장명 조회 라우터
router.get('/names', async (req, res) => {
    try {
        const query = `SELECT store_id, name FROM Stores`; // store_id와 name을 선택
        const result = await db.executeQuery(query);

        // 결과가 없으면 빈 배열을 반환
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching store names:', error);
        res.status(500).json({ error: 'Error fetching store names: ' + error.message });
    }
});


module.exports = router;
