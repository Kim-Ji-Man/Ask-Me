const express = require('express');
const router = express.Router();
const db = require('../models/db');
router.get('/', async (req, res) => {
    const sql = `
        SELECT 
            n.noti_id, 
            n.user_id, 
            n.alert_id, 
            n.device_id, 
            d.device_name,
            n.noti_method, 
            n.sent_at, 
            n.message, 
            n.image_url, 
            n.status 
        FROM 
            Notification n
        JOIN 
            Detection_Devices d ON n.device_id = d.device_id;
    `;
    
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
        console.log("알림라우터");
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).send('Error fetching notifications');
    }
});


module.exports = router;
