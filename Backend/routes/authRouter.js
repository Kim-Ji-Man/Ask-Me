const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');
const { sendMember } = require('../websockets'); // WebSocket 알림 전송 함수 임포트


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
 *                   enum: ["user", "admin", "master", "guard"] 
 *                   example: "admin"
 *                 gender:
 *                   type: string
 *                   example: "man"
 *                 birth:
 *                   type: string
 *                   example: "991213"
 *                 storeId:
 *                   type: string
 *                   example: "1"
 *                   description: "Required only for guards"
 *                 mem_name:
 *                   type: string
 *                   example: "John"
 *                 nick:
 *                   type: string
 *                   example: "J"
 *       responses:
 *         201:
 *           description: User registered successfully
 *         400:
 *           description: "Missing required fields. For guards, storeId is required."
 *         500:
 *           description: Error registering user
 */
router.post('/register', async (req, res) => {
    const { username, mem_name, password, email, phone_number, role, gender, birth, nick, storeId } = req.body;

    // 필수 값 검증
    if (!username || !mem_name || !password || !phone_number || !role || !gender || !birth ) {
        return res.status(400).send('Username, mem_name,password, phone number, role, gender, birth, and storeId are required');
    }

    // 역할 검증
    const allowedRoles = ['user', 'admin', 'master', 'guard'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).send('Invalid role');
    }

    // 역할에 따라 nick 필수 여부 결정
    if ((role === 'user' || role === 'guard') && !nick) {
        return res.status(400).send('Nick is required for user and guard roles');
    }

    // 경비원일 경우 storeId 필수
    if (role === 'guard' && !storeId) {
        return res.status(400).send('storeId is required for guards');
    }

    try {
        // 유저 등록 및 user_id 반환
        const userId = await authController.registerUser( username, mem_name, password, email, phone_number, role, gender, birth, storeId);

        // 성공 시 user_id와 함께 응답
        res.status(201).send({ message: 'User registered successfully', user_id: userId });

        // WebSocket으로 회원가입 알림 전송
        sendMember(`회원 ${mem_name}님이 성공적으로 가입되었습니다.`);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Error registering user');
    }
});



/**
 * @swagger
 * paths:
 *   /auth/stores:
 *     post:
 *       summary: Register a new store
 *       tags:
 *         - Stores
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "My Store"
 *                   description: "The name of the store"
 *                 address:
 *                   type: string
 *                   example: "address"
 *                   description: "The store's address"
 *                 phone_number:
 *                   type: string
 *                   example: "123-456-7890"
 *                   description: "The store's phone number (optional)"
 *                 business_number:
 *                   type: string
 *                   example: "123456789"
 *                   description: "The store's business number (optional)"
 *                 latitude:
 *                   type: number
 *                   example: 37.7749
 *                   description: "The store's latitude"
 *                 longitude:
 *                   type: number
 *                   example: -122.4194
 *                   description: "The store's longitude"
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                   description: "The user ID of the store owner"
 *       responses:
 *         201:
 *           description: Store registered successfully
 *         400:
 *           description: Missing required fields (name, address, latitude, longitude, or user ID)
 *         500:
 *           description: Error registering store
 */

router.post('/stores', async (req, res) => {
    const { name, address, phone_number, business_number, latitude, longitude, user_id } = req.body;

    // 필수 필드 확인
    if (!name || !address || !latitude || !longitude || !user_id) {
        return res.status(400).send('Name, address, latitude, longitude, and user ID are required.');
    }

    try {
        // 매장 등록 로직 호출
        await storeController.registerStore(name, address, phone_number, business_number, latitude, longitude, user_id);
        res.status(201).send('Store registered successfully');
    } catch (err) {
        console.error('Error during store registration:', err);
        res.status(500).send('Error registering store');
    }
});

/**
 * @swagger
 * /auth/stores/{store_id}:
 *   get:
 *     summary: 매장 정보 조회
 *     tags:
 *       - Stores
 *     description: 주어진 store_id를 기반으로 매장 정보를 조회합니다.
 *     parameters:
 *       - name: store_id
 *         in: path
 *         required: true
 *         description: 조회할 매장의 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공적으로 매장 정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 매장 ID
 *                 name:
 *                   type: string
 *                   description: 매장 이름
 *                 address:
 *                   type: string
 *                   description: 매장 주소
 *                 phone_number:
 *                   type: string
 *                   description: 매장 전화번호
 *                 business_number:
 *                   type: string
 *                   description: 사업자 번호
 *                 latitude:
 *                   type: number
 *                   description: 위도
 *                 longitude:
 *                   type: number
 *                   description: 경도
 *       404:
 *         description: 매장을 찾을 수 없습니다.
 *       500:
 *         description: 매장 정보를 가져오는 중 오류가 발생했습니다.
 */

// 매장 정보 조회 라우터 (유저 아이디 기준)
router.get('/stores/:user_id', async (req, res) => {
    const { user_id } = req.params; // 요청에서 매장 ID 추출

    try {
        // 매장 정보를 ID로 조회
        const store = await storeController.getStoreById(user_id);

        // 매장이 존재하지 않을 경우 404 응답
        if (!store) {
            return res.status(404).send('Store not found');
        }

        // 매장 정보를 성공적으로 찾은 경우 200 응답과 함께 매장 정보 반환
        res.status(200).json(store);
    } catch (err) {
        // 오류가 발생한 경우 콘솔에 오류 로그 출력 및 500 응답
        console.error('Error fetching store:', err);
        res.status(500).send('Error retrieving store information');
    }
});


/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: Update user and store information
 *     tags: [User]
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
 *                 description: The user's email address
 *               phone_number:
 *                 type: string
 *                 description: The user's phone number
 *               mem_name:
 *                 type: string
 *                 description: The user's name
 *               store:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     description: Store's address
 *                   business_number:
 *                     type: string
 *                     description: Store's business registration number
 *             required:
 *               - phone_number
 *               - mem_name
 *               - address
 *               - business_number
 *     responses:
 *       200:
 *         description: User and store information updated successfully
 *       400:
 *         description: Required fields are missing
 *       500:
 *         description: Error updating user or store information
 */



// 사용자 및 매장 정보 업데이트 (마이페이지)
router.put('/update', authController.authenticateToken, async (req, res) => {
    const { email, phone_number, mem_name, store } = req.body;
    const { address, business_number } = store || {}; // store 정보가 없는 경우를 대비

    // 필수 필드 체크
    if (!phone_number || !mem_name || !address || !business_number) {
        return res.status(400).send('Phone number, mem_name, address, and business_number are required');
    }

    try {
        // 사용자 및 매장 정보 업데이트
        await authController.updateUserAndStore(req.user.userId, { 
            email, 
            phone_number, 
            mem_name 
        }, { 
            address, 
            business_number 
        });

        res.status(200).send('User and store information updated successfully');
    } catch (err) {
        console.error('Error updating user or store information:', err);
        res.status(500).send('Error updating user or store information');
    }
});


/**
 * @swagger
 * /auth/update_app:
 *   put:
 *     summary: 사용자 정보 업데이트
 *     description: 사용자의 전화번호, 닉네임, 이메일, 생년월일을 업데이트합니다.
 *     tags: [Mypage]
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
 *                 example: user@example.com
 *               phone_number:
 *                 type: string
 *                 example: '010-1234-5678'
 *               nick:
 *                 type: string
 *                 example: 'nickname'
 *               birth:
 *                 type: string
 *                 format: date
 *                 example: '900101'
 *     responses:
 *       200:
 *         description: 사용자 정보가 성공적으로 업데이트되었습니다.
 *       400:
 *         description: 필수 필드가 누락되었습니다.
 *       500:
 *         description: 사용자 정보 업데이트 중 오류가 발생했습니다.
 */

// 사용자 정보 업데이트 (마이페이지)
router.put('/update_app', authController.authenticateToken, async (req, res) => {
    const { email, phone_number, nick, birth } = req.body;

    // 필수 필드 체크
    if (!phone_number || !nick || !email || !birth) {
        return res.status(400).send('Phone number, nick, email, and birth are required');
    }

    const userId = req.user.userId; // 사용자 ID 가져오기

    try {
        // 사용자 정보 업데이트
        await authController.updateUserInfo(userId, { 
            email, 
            phone_number, 
            nick, 
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
 *                 username:  
 *                   type: string
 *                   example: "master"  
 *                 password:
 *                   type: string
 *                   example: "0000"
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
 * /auth/guard/protected:
 *   get:
 *     summary: Access protected route for general guard
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted to authorized guard
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access forbidden for unauthorized guard
 */
router.get('/guard/protected', authController.authenticateToken, authController.authorizeGuard, (req, res) => {
    res.send('This is a protected route for authorized guard');
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
