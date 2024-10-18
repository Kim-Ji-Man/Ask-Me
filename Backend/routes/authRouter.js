const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * paths:
 *   /auth/register:
 *     post:
 *       summary: Register a new user
 *       tags:
 *         - Auth
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "john"
 *                 password:
 *                   type: string
 *                   example: "password"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *                 phone_number:
 *                   type: string
 *                   example: "123-456-7890" 
 *                 role:
 *                   type: string
 *                   enum: ["user", "admin", "master"]
 *                   example: "admin"
 *                 gender:
 *                   type: string
 *                   example: "man"
 *                 birth:
 *                   type: string
 *                   example: "991213"
 *       responses:
 *         201:
 *           description: User registered successfully
 *         400:
 *           description: Username, password, phone number, role, gender, and birth are required
 *         500:
 *           description: Error registering user
 */

router.post('/register', async (req, res) => {
    const { username, password, email, phone_number, role, gender, birth } = req.body;
    
    if (!username || !password || !phone_number || !role || !gender || !birth) {
        return res.status(400).send('Username, password, phone number, role, gender, and birth are required');
    }

    // 역할이 올바른지 확인
    const allowedRoles = ['user', 'admin', 'master'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).send('Invalid role');
    }

    try {
        await authController.registerUser(username, password, email, phone_number, role, gender, birth);
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Error registering user');
    }
});

/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: Update user information
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "123-456-7890" 
 *               gender:
 *                 type: string
 *                 example: "man"
 *               birth:
 *                 type: string
 *                 example: "991213"
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       400:
 *         description: Invalid input or missing required fields
 *       500:
 *         description: Error updating user information
 */

// 사용자 정보 업데이트
router.put('/update', authController.authenticateToken, async (req, res) => {
    const { email, phone_number, gender, birth } = req.body;

    if (!phone_number || !gender || !birth) {
        return res.status(400).send('Phone number, gender, and birth are required');
    }

    try {
        await authController.updateUser(req.user.userId, { 
            email, 
            phone_number, 
            gender, 
            birth 
        });
        res.status(200).send('User information updated successfully');
    } catch (err) {
        console.error('Error updating user information:', err);
        res.status(500).send('Error updating user information');
    }
});


/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: Delete a user account
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       403:
 *         description: Forbidden (not authorized)
 *       500:
 *         description: Error deleting user account
 */
router.delete('/delete', authController.authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        await authController.deleteUser(userId);
        res.send('User account deleted successfully');
    } catch (err) {
        console.error('Error deleting user account:', err);
        res.status(500).send('Error deleting user account');
    }
});

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Get a list of all users in the system.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user's ID
 *                   username:
 *                     type: string
 *                     description: The user's username
 *                   email:
 *                     type: string
 *                     description: The user's email
 *       500:
 *         description: Error fetching users
 */
router.get('/users', authController.authenticateToken, async (req, res) => {
    try {
        const users = await authController.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

/**
 * @swagger
 * paths:
 *   /auth/login:
 *     post:
 *       summary: Log in a user
 *       tags:
 *         - Auth
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:  
 *                   type: string
 *                   example: "john@example.com"  
 *                 password:
 *                   type: string
 *                   example: "password"
 *       responses:
 *         200:
 *           description: User logged in successfully
 *         401:
 *           description: Invalid credentials
 */
router.post('/login', authController.login);


/**
 * @swagger
 * /auth/master/protected:
 *   get:
 *     summary: Access protected route for master only
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted to master
 *       403:
 *         description: Forbidden (not master)
 */
router.get('/master/protected', authController.authenticateToken, authController.authorizeMaster, (req, res) => {
    res.send('This is a protected route for master only');
});

/**
 * @swagger
 * /auth/admin/protected:
 *   get:
 *     summary: Access protected route for admin and master only
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted to admin or master
 *       403:
 *         description: Admin access required
 */
router.get('/admin/protected', authController.authenticateToken, authController.authorizeAdmin, (req, res) => {
    res.send('This is a protected route for admin and master only');
});

/**
 * @swagger
 * /auth/user/protected:
 *   get:
 *     summary: Access protected route for general users
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted to authorized users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access forbidden for unauthorized users
 */
router.get('/user/protected', authController.authenticateToken, authController.authorizeUser, (req, res) => {
    res.send('This is a protected route for authorized users');
});

module.exports = router;
