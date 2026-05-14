const express = require('express');
const router = express.Router();
// Đảm bảo đường dẫn tới file database là chính xác
const pool = require('../config/database'); 

router.post('/', async (req, res) => {
    try {
        // 1. Nhận dữ liệu từ Frontend
        // (Thường form Vue của bạn sẽ gửi lên title/subject, description, orderId, và có thể là ID người dùng)
        const { title, subject, description, orderId, userId } = req.body;

        // 2. Map dữ liệu (Nếu Frontend gửi 'title' thì mình tự động gán nó vào 'subject' cho khớp SQL)
        const finalSubject = subject || title;

        // 3. Kiểm tra điều kiện bắt buộc
        if (!finalSubject || !description) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tiêu đề và mô tả sự cố.' });
        }

        // 4. LƯU VÀO DATABASE (Đã căn chỉnh đúng 100% các cột trong bảng của bạn)
        const [result] = await pool.execute(
            `INSERT INTO complaints (subject, description, order_id, complainant_id, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [
                finalSubject, 
                description, 
                orderId ? parseInt(orderId) : null, // Mã đơn hàng (nếu có)
                userId || null // ID người khiếu nại (nếu Frontend có gửi)
            ]
        );

        // 5. Báo thành công
        res.status(201).json({ 
            success: true,
            message: 'Đã lưu khiếu nại vào database thành công!',
            complaintId: result.insertId
        });

    } catch (error) {
        console.error("Lỗi SQL khi lưu khiếu nại:", error);
        res.status(500).json({ message: 'Lỗi server khi lưu khiếu nại', error: error.message });
    }
});
router.get('/', async (req, res) => {
    try {
        // Query lấy dữ liệu từ bảng complaints, sắp xếp mới nhất lên đầu
        const [rows] = await pool.execute(
            'SELECT * FROM complaints ORDER BY created_at DESC'
        );
        
        // Gửi trả về Frontend
        res.status(200).json(rows);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khiếu nại:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});
module.exports = router;