const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

// 사용자 등록 함수
async function registerUser(username, password, email, phoneNumber, role, gender, businessNumber, birth) {
    console.log("register:",username, password, email, phoneNumber, role, gender, businessNumber, birth);

    const allowedRoles = ['user', 'admin', 'master'];
    if (!allowedRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    // admin 역할에 대해 businessNumber가 필요함
    if (role === 'admin' && !businessNumber) {
        throw new Error('Business number is required for admin role');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 현재 시간 및 기본 계정 상태 설정
    const created_at = new Date(); // 현재 시간
    const account_status = 'active'; // 기본값으로 설정

    // SQL 쿼리 작성
    const query = `INSERT INTO Users (username, password, email, phone_number, role, gender, created_at, account_status, business_number, birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // businessNumber가 undefined인 경우 null로 설정
    const params = [
        username,
        hashedPassword,
        email,
        phoneNumber,
        role,
        gender,
        created_at,
        account_status,
        businessNumber !== undefined ? businessNumber : null, // businessNumber가 undefined일 때 null로 설정
        birth
    ];

    // 쿼리 실행
    await db.executeQuery(query, params);
}

// JWT 토큰 생성
function generateToken(user) {
    return jwt.sign({ userId: user.user_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
}

// login 함수
async function login(req, res) {
    const { email, password } = req.body; 
    console.log("로그인 시도:", email, password);
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user);  
        
        // 성공 응답에 success: true 추가
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
async function authenticateUser(email, password) {
    const query = `SELECT * FROM Users WHERE email = ?`; 
    const users = await db.executeQuery(query, [email]); 

    if (users.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    return user;
}

// 사용자 정보 업데이트
async function updateUser(userId, updateData) {
    const query = `
        UPDATE Users
        SET email = ?, phone_number = ?, gender = ?, business_number= ?, birth = ? 
        WHERE user_id = ?
    `;

    const params = [
        updateData.email,
        updateData.phone_number,
        updateData.gender,
        updateData.business_number || null,
        updateData.birth,
        userId
    ];

    const result = await db.executeQuery(query, params);

    if (result.affectedRows === 0) {
        throw new Error('Invalid user ID or update data');
    }
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
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
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

function authorizeUser(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

module.exports = { registerUser, login, authenticateToken, authorizeMaster, authorizeAdmin, authorizeUser, updateUser, deleteUser, getAllUsers };
