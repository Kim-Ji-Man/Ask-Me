const db = require('../models/db');

// 매장 등록 로직
exports.registerStore = async (name, address, phone_number, business_number, latitude, longitude, user_id) => {
    try {
        // 현재 시간 설정
        const created_at = new Date(); // 현재 시간

        const query = `
            INSERT INTO Stores (name, address, phone_number, business_number, latitude, longitude, created_at, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.executeQuery(query, [name, address, phone_number, business_number, latitude, longitude, created_at, user_id]);
        return result;
    } catch (err) {
        throw new Error('Store registration failed: ' + err.message);
    }
};

// 매장 조회 로직 (SQL 쿼리 사용)
exports.getStoreById = async (user_id) => {
    try {
        const query = `
            SELECT * FROM Stores WHERE user_id = ?
        `;
        const result = await db.executeQuery(query, [user_id]);

        // 결과가 없으면 예외를 던집니다.
        if (result.length === 0) {
            throw new Error(`Store with ID ${user_id} not found`);
        }

        return result[0]; // 첫 번째 매장 정보 반환
    } catch (error) {
        console.error('Error fetching store:', error);
        throw new Error('Error fetching store: ' + error.message);
    }
};
