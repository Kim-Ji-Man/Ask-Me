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

router.get('/alertlist', async (req, res) => {
    const sql = `
    SELECT 
    n.alert_id,
    a.detection_time,
    a.level,
    d.device_name,
    n.noti_method,
    n.sent_at,
    n.message,
    n.image,
    n.status
FROM 
    Notification n
INNER JOIN 
    Alert_Log a ON n.alert_id = a.alert_id
INNER JOIN 
    Detection_Device d ON a.device_id = d.device_id
ORDER BY 
    a.detection_time DESC
LIMIT 5;
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
