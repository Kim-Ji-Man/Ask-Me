const express = require('express');
const router = express.Router();
const db = require('../models/db');
router.get('/', async (req, res) => {
    const sql = `
 SELECT 
    n.noti_id, 
    n.user_id, 
    n.alert_id, 
    d.device_id, 
    d.device_name, 
    d.device_type, 
    d.location, 
    n.noti_method, 
    n.sent_at, 
    n.message, 
    n.image, 
    n.status
FROM 
    Notification n
JOIN 
    Alert_Log a ON n.alert_id = a.alert_id
JOIN 
    Detection_Device d ON a.device_id = d.device_id
ORDER BY 
    n.sent_at DESC;


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
