// routes/camera.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

/**
 * @swagger
 * tags:
 *   name: Cameras
 *   description: CCTV camera management
 */

/**
 * @swagger
 * /api/cameras:
 *   post:
 *     summary: Add a new camera
 *     tags: [Cameras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_name:
 *                 type: string
 *                 description: The name of the camera
 *               device_type:
 *                 type: string
 *                 description: The type of the device (e.g., CCTV, IP camera)
 *               location:
 *                 type: string
 *                 description: The location of the camera
 *               rtsp_url:
 *                 type: string
 *                 description: The RTSP URL of the camera
 *             required:
 *               - device_name
 *               - device_type
 *               - location
 *               - rtsp_url
 *     responses:
 *       201:
 *         description: Camera created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device_id:
 *                   type: integer
 *                   description: The ID of the created camera
 *                 device_name:
 *                   type: string
 *                 device_type:
 *                   type: string
 *                 location:
 *                   type: string
 *                 rtsp_url:
 *                   type: string
 *       500:
 *         description: Error inserting camera
 */
router.post('/cameras', async (req, res) => {
    const { device_name, device_type, location, rtsp_url } = req.body;

    const sql = 'INSERT INTO Detection_Device (device_name, device_type, location, rtsp_url, last_checked_at) VALUES (?, ?, ?, ?, NOW())';
    try {
        const results = await db.executeQuery(sql, [device_name, device_type, location, rtsp_url]);
        res.status(201).send({ device_id: results.insertId, device_name, device_type, location, rtsp_url });
    } catch (err) {
        console.error('Error inserting camera:', err);
        return res.status(500).send('Error inserting camera');
    }
});


/**
 * @swagger
 * /api/cameras:
 *   get:
 *     summary: Get all cameras
 *     tags: [Cameras]
 *     responses:
 *       200:
 *         description: A list of cameras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   device_id:
 *                     type: integer
 *                   device_name:
 *                     type: string
 *                   device_type:
 *                     type: string
 *                   location:
 *                     type: string
 *                   rtsp_url:
 *                     type: string
 *       500:
 *         description: Error fetching cameras
 */
router.get('/cameras', async (req, res) => {
    const sql = 'SELECT * FROM Detection_Device';
    try {
        const results = await db.executeQuery(sql);
        res.send(results);
    } catch (err) {
        console.error('Error fetching cameras:', err);
        return res.status(500).send('Error fetching cameras');
    }
});

module.exports = router;
