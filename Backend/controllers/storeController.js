const db = require('../models/db');

// 매장 등록 로직
exports.registerStore = async (name, address, phone_number, business_number, latitude, longitude, user_id) => {
    try {
        const query = `
            INSERT INTO Stores (name, address, phone_number, business_number, latitude, longitude, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.executeQuery(query, [name, address, phone_number, business_number, latitude, longitude, user_id]);
        return result;
    } catch (err) {
        throw new Error('Store registration failed: ' + err.message);
    }
};
