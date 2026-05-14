const pool = require('../config/database');

const createNotification = async (receiverId, title, content, relatedOrderId = null) => {
    const [result] = await pool.execute(
        `INSERT INTO notifications (receiver_id, title, content, related_order_id)
         VALUES (?, ?, ?, ?)`,
        [receiverId, title, content, relatedOrderId]
    );
    return result.insertId;
};

const getUnreadNotifications = async (receiverId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE receiver_id = ? AND is_read = FALSE ORDER BY created_at DESC',
        [receiverId]
    );
    return rows;
};

const markAsRead = async (notificationId) => {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
};

module.exports = {
    createNotification,
    getUnreadNotifications,
    markAsRead
};
