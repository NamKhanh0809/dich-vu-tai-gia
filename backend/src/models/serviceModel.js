const pool = require('../config/database');

const getAllActiveServices = async () => {
    const [rows] = await pool.execute(
        'SELECT id, name, description, image_url, price_range, base_price, status FROM Services WHERE status = "active"'
    );
    return rows;
};

const getServiceById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM Services WHERE id = ? AND status = "active"',
        [id]
    );
    return rows[0];
};

const createService = async (name, description, imageUrl, priceRange, basePrice) => {
    const [result] = await pool.execute(
        `INSERT INTO Services (name, description, image_url, price_range, base_price, status)
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [name, description, imageUrl, priceRange, basePrice]
    );
    return result.insertId;
};

const updateService = async (id, name, description, imageUrl, priceRange, basePrice) => {
    const [result] = await pool.execute(
        `UPDATE Services 
         SET name = ?, description = ?, image_url = ?, price_range = ?, base_price = ?
         WHERE id = ?`,
        [name, description, imageUrl, priceRange, basePrice, id]
    );
    return result.affectedRows;
};

const softDeleteService = async (id) => {
    await pool.execute('UPDATE Services SET status = "deleted" WHERE id = ?', [id]);
};

module.exports = {
    getAllActiveServices,
    getServiceById,
    createService,
    updateService,
    softDeleteService
};
