const pool = require('../config/database');

const createUser = async (email, phone, passwordHash, role = 'customer') => {
    const [result] = await pool.execute(
        'INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, ?, ?)',
        [email, phone, passwordHash, role]
    );
    return result.insertId;
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const findUserByPhone = async (phone) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0];
};

const findUserById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

const updateUserLockStatus = async (userId, isLocked) => {
    await pool.execute('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked, userId]);
};

const getAllUsers = async (filters = {}) => {
    let query = 'SELECT id, email, phone, role, is_locked, created_at FROM users WHERE role != "admin"';
    const params = [];
    if (filters.role) {
        query += ' AND role = ?';
        params.push(filters.role);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
};

const updateUserLock = async (userId, isLocked) => {
    await pool.execute('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked, userId]);
     return result.affectedRows; 
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserByPhone,
    findUserById,
    updateUserLockStatus,
    getAllUsers,
    updateUserLock
};
