const pool = require('../config/database');

const getAddressesByUser = async (userId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM addressbook WHERE user_id = ? ORDER BY is_default DESC',
        [userId]
    );
    return rows;
};

const createAddress = async (userId, label, recipientName, recipientPhone, fullAddress, isDefault) => {
    if (isDefault) {
        await pool.execute('UPDATE addressbook SET is_default = FALSE WHERE user_id = ?', [userId]);
    }
    const [result] = await pool.execute(
        `INSERT INTO addressbook (user_id, label, recipient_name, recipient_phone, full_address, is_default)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, label, recipientName, recipientPhone, fullAddress, isDefault]
    );
    return result.insertId;
};

module.exports = {
    getAddressesByUser,
    createAddress
};
