const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// 1. IMPORT ĐẦY ĐỦ CÁC HÀM TỪ CONTROLLER (Đã bổ sung getAdminStats và getReports)
const {
    getAdminStats,          // <--- Thêm mới
    getReports,             // <--- Thêm mới
    getAvailableWorkers,
    approveWorker, 
    rejectWorker,
    getUsers, 
    uploadServicesCSV,
    lockUser,
    getPendingWorkers, 
    addService, 
    editService, 
    deleteService,
    getOrderSummary, 
    getOrdersReport,
    getPendingOrdersList, 
    approveOrderByAdmin, 
    rejectOrderByAdmin
} = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ĐÃ XÓA HÀM getAdminStats GIẢ (TRẢ VỀ SỐ 0) Ở ĐÂY!!!

router.use(verifyToken, requireRole('admin'));

// ==== 1. Quản lý người dùng ====
router.get('/users', getUsers);
router.patch('/users/:id/lock', lockUser);

// ==== 2. Quản lý thợ và dịch vụ ====
router.get('/worker-approvals', getPendingWorkers);
router.patch('/workers/:id/approve', approveWorker);
router.patch('/workers/:id/reject', rejectWorker);

router.post('/services/upload-csv', upload.single('file'), uploadServicesCSV); 
router.post('/services', addService);
router.put('/services/:id', editService);
router.delete('/services/:id', deleteService);

// ==== 3. Thống kê (ĐÃ SỬA CHUẨN) ====
router.get('/stats', getAdminStats);         // Gọi hàm xịn từ controller
router.get('/reports', getReports);          // API cho trang Báo cáo
router.get('/reports/orders/summary', getOrderSummary);
router.get('/reports/orders', getOrdersReport); // Đổi link này một chút để không trùng với báo cáo
router.get('/workers/available', getAvailableWorkers);

// ==== 4. Quản lý khiếu nại ====
router.get('/complaints', async (req, res) => {
    try {
        const pool = require('../config/database');
        const [rows] = await pool.execute(`
            SELECT c.*, 
                   IFNULL(p.full_name, u.email) as customer_name 
            FROM complaints c 
            LEFT JOIN users u ON c.complainant_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            ORDER BY c.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

router.put('/complaints/:id/resolve', async (req, res) => {
    try {
        const pool = require('../config/database');
        const complaintId = req.params.id;
        const { status } = req.body; 
        await pool.execute(
            'UPDATE complaints SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, complaintId]
        );
        res.status(200).json({ message: 'Đã cập nhật trạng thái khiếu nại' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
    }
});

// ==== 5. Phê duyệt đơn hàng ====
router.get('/orders/pending', getPendingOrdersList);
router.patch('/orders/:id/approve', approveOrderByAdmin);
router.patch('/orders/:id/reject', rejectOrderByAdmin);

module.exports = router;