const pool = require('../config/database');

const createEmptyProfile = async (userId) => {
    await pool.execute(
        'INSERT INTO Profiles (user_id, full_name) VALUES (?, ?)',
        [userId, '']   // full_name có thể cập nhật sau
    );
};

const updateWorkerProfile = async (userId, cccdFrontUrl, cccdBackUrl, certificateUrl, fullName) => {
    const [result] = await pool.execute(
        `UPDATE Profiles 
         SET full_name = ?, cccd_front_url = ?, cccd_back_url = ?, certificate_url = ?, approval_status = 'pending'
         WHERE user_id = ?`,
        [fullName, cccdFrontUrl, cccdBackUrl, certificateUrl, userId]
    );
    return result.affectedRows;
};

const getProfileByUserId = async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM Profiles WHERE user_id = ?', [userId]);
    return rows[0];
};

const getAllPendingProfiles = async () => {
    const [rows] = await pool.execute(
        `SELECT p.*, u.email, u.phone, u.role 
         FROM Profiles p 
         JOIN Users u ON p.user_id = u.id 
         WHERE p.approval_status = 'pending' AND u.role = 'worker'`
    );
    return rows;
};

const updateApprovalStatus = async (userId, status, rejectReason = null) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cập nhật trạng thái duyệt trong bảng profiles
        await connection.execute(
            'UPDATE profiles SET approval_status = ?, rejected_reason = ? WHERE user_id = ?',
            [status, rejectReason, userId]
        );

        // 2. Nếu Admin duyệt (status = 'approved'), nâng cấp user này thành thợ (worker)
        if (status === 'approved') {
            await connection.execute(
                'UPDATE users SET role = "worker" WHERE id = ?',
                [userId]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error; // Ném lỗi ra để Controller bắt được
    } finally {
        connection.release();
    }
};

const updateProfileImages = async (userId, images) => {
    const certificatesJson = JSON.stringify(images.certificates);
    await pool.execute(
        `UPDATE Profiles SET 
           cccd_front_image = ?, 
           cccd_back_image = ?, 
           certificates_images = ?,
           approval_status = 'pending'
         WHERE user_id = ?`,
        [images.cccd_front, images.cccd_back, certificatesJson, userId]
    );
};

module.exports = {
    createEmptyProfile,
    updateWorkerProfile,
    getProfileByUserId,
    getAllPendingProfiles,
    updateApprovalStatus,
    updateProfileImages
};
