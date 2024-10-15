const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Example endpoint
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/example', (req, res) => {
    res.json({ message: 'This is an example route' });
});

module.exports = router;
