const express = require('express');
const router = express.Router();
const db = require('../models/db');
router.get('/', async (req, res) => {
    const sql = `
        SELECT * FROM Near_by_Facilitie;
    `;
    
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
        console.log("지도 라우터");
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});




module.exports = router;