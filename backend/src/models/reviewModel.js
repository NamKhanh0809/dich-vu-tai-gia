const pool = require('../config/database');

const createReview = async (orderId, customerId, workerId, rating, comment) => {
    const [result] = await pool.execute(
        `INSERT INTO reviews (order_id, customer_id, worker_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, customerId, workerId, rating, comment]
    );
    return result.insertId;
};

const getReviewsByWorker = async (workerId) => {
    const [rows] = await pool.execute(
        `SELECT r.*, u.full_name as customer_name 
         FROM reviews r 
         JOIN profiles u ON r.customer_id = u.user_id 
         WHERE r.worker_id = ? 
         ORDER BY r.created_at DESC`,
        [workerId]
    );
    return rows;
};

const checkReviewExistsForOrder = async (orderId) => {
    const [rows] = await pool.execute('SELECT id FROM reviews WHERE order_id = ?', [orderId]);
    return rows.length > 0;
};

module.exports = {
    createReview,
    getReviewsByWorker,
    checkReviewExistsForOrder
};
