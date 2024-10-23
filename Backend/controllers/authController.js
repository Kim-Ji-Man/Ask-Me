const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

async function registerUser(username, mem_name, password, email, phoneNumber, role, gender, birth, storeId = null) {
    console.log("register:", username, mem_name, password, email, phoneNumber, role, gender, birth);

    const allowedRoles = ['user', 'admin', 'master', 'guard']; // 경비원 역할 포함
    if (!allowedRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 현재 시간 설정
    const created_at = new Date(); // 현재 시간

    // account_status 설정
    const account_status = (role === 'guard') ? 'inactive' : 'active'; // 경비원일 경우 inactive, 그 외는 active

    // SQL 쿼리 작성
    const query = `INSERT INTO Users (username, mem_name, password, email, phone_number, role, gender, created_at, account_status, birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        username,
        mem_name, 
        hashedPassword,
        email,
        phoneNumber,
        role,
        gender,
        created_at,
        account_status,
        birth
    ];

    // 쿼리 실행
    await db.executeQuery(query, params);

    // 경비원인 경우 매장에 배정하는 로직은 나중에 처리 가능
    if (role === 'guard' && storeId) {
        const user = await db.executeQuery(`SELECT user_id FROM Users WHERE email = ?`, [email]);
        const guardId = user[0].user_id;

        // 경비원이 속한 매장에 추가 (storeId가 제공된 경우에만 실행)
        const guardStoreQuery = `INSERT INTO Guards_Stores (user_id, store_id) VALUES (?, ?)`;
        await db.executeQuery(guardStoreQuery, [guardId, storeId]);
    }

    // 방금 추가된 유저의 user_id 가져오기
    const [result] = await db.executeQuery('SELECT LAST_INSERT_ID() as user_id');

    // user_id 반환
    return result.user_id;
}

// JWT 토큰 생성
function generateToken(user) {
    return jwt.sign({ userId: user.user_id, role: user.role, storeId: user.store_id }, 'your_jwt_secret', { expiresIn: '1h' });
}

// 로그인 함수
async function login(req, res) {
    const { username, password } = req.body;  
    console.log("로그인 시도:", username, password);
    
    if (!username || !password) {  
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const user = await authenticateUser(username, password);  
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user);  
        
        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            token 
        });
        console.log("토큰:", token);
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 사용자 인증 함수
async function authenticateUser(username, password) {
    const query = `SELECT * FROM Users WHERE username = ?`; 
    const users = await db.executeQuery(query, [username]);  

    if (users.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    // Guards_Stores에서 경비원과 매장 정보 조회
    if (user.role === 'guard') {
        const storeQuery = `SELECT store_id FROM Guards_Stores WHERE user_id = ?`;
        const store = await db.executeQuery(storeQuery, [user.user_id]);
        user.store_id = store[0].store_id; // 매장 ID 추가
    }

    return user;
}

// 사용자 정보 업데이트
async function updateUser(userId, updateData) {
    const query = `UPDATE Users SET email = ?, phone_number = ?, gender = ?, birth = ?, mem_name = ? WHERE user_id = ?`;
    const params = [
        updateData.email,
        updateData.phone_number,
        updateData.gender,
        updateData.birth,
        updateData.mem_name, 
        userId
    ];

    const result = await db.executeQuery(query, params);

    if (result.affectedRows === 0) {
        throw new Error('Invalid user ID or update data');
    }
}

// 매장에 소속된 모든 경비원 조회
async function getGuardsByStore(storeId) {
    const query = `SELECT U.* FROM Users U JOIN Guards_Stores GS ON U.user_id = GS.user_id WHERE GS.store_id = ?`;
    const result = await db.executeQuery(query, [storeId]);
    return result; // 경비원 목록 반환
}

// 모든 사용자 정보 조회
async function getAllUsers() {
    const query = `SELECT * FROM Users`; // 전체 사용자 조회 쿼리
    const result = await db.executeQuery(query);
    return result; // 사용자 목록 반환
}

// 사용자 삭제
async function deleteUser(userId) {
    const query = `DELETE FROM Users WHERE user_id = ?`;
    const result = await db.executeQuery(query, [userId]);

    if (result.affectedRows === 0) {
        throw new Error('Invalid user ID');
    }
}

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                // 토큰이 만료된 경우
                return res.status(401).json({ success: false, message: 'Unauthorized: Token has expired' });
            }
            return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
        }

        req.user = user; // 사용자 정보를 요청 객체에 저장
        next();
    });
}


// 권한 확인 미들웨어
function authorizeMaster(req, res, next) {
    if (req.user && req.user.role === 'master') {
        next();
    } else {
        res.status(403).send('Forbidden: Master admin access required');
    }
}

function authorizeAdmin(req, res, next) {
    if (req.user && (req.user.role === 'master' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).send('Forbidden: Admin access required');
    }
}

function authorizeGuard(req, res, next) {
    if (req.user && req.user.role === 'guard') {
        next();
    } else {
        res.status(403).send('Forbidden: Guard access required');
    }
}

function authorizeUser(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

module.exports = {
    registerUser,
    login,
    authenticateToken,
    authorizeMaster,
    authorizeAdmin,
    authorizeGuard,
    authorizeUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getGuardsByStore 
};