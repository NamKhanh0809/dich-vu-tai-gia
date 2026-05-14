const pool = require('../config/database');

// Lấy danh sách khiếu nại (có thể lọc theo status)
const getAllComplaints = async (statusFilter = null) => {
    let query = `
        SELECT c.*, 
               o.id as order_id, o.status as order_status,
               u.email as complainant_email, u.phone as complainant_phone,
               p.full_name as complainant_name
        FROM complaints c
        JOIN orders o ON c.order_id = o.id
        JOIN users u ON c.complainant_id = u.id
        JOIN profiles p ON u.id = p.user_id
        WHERE 1=1
    `;
    const params = [];
    if (statusFilter) {
        query += ' AND c.status = ?';
        params.push(statusFilter);
    }
    query += ' ORDER BY c.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
};

// Cập nhật giải quyết khiếu nại
const resolveComplaint = async (complaintId, resolution, newStatus) => {
    // newStatus: 'resolved' hoặc 'refunded'
    const [result] = await pool.execute(
        `UPDATE complaints 
         SET resolution = ?, status = ?, resolved_at = NOW()
         WHERE id = ?`,
        [resolution, newStatus, complaintId]
    );
    return result.affectedRows;
};

// Lấy thông tin complaint kèm order_id (để cập nhật order nếu hoàn tiền)
const getComplaintById = async (complaintId) => {
    const [rows] = await pool.execute('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    return rows[0];
};

module.exports = {
    getAllComplaints,
    resolveComplaint,
    getComplaintById
};
