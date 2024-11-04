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

router.get('/alim', async (req, res) => {
    const sql = `
        SELECT 
    al.alert_id,
    al.detection_time,
    al.detected_weapon,
    al.level,
    s.latitude,
    s.longitude,
    s.name AS store_name
FROM 
    Alert_Log al
JOIN 
    Detection_Device d ON al.device_id = d.device_id
JOIN 
    Stores s ON d.store_id = s.store_id
WHERE 
    al.detected_weapon IS NOT NULL
ORDER BY 
    al.detection_time DESC;
    `;
    
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
        console.log("흉기알림지도 라우터");
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});




module.exports = router;