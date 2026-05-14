const express = require('express');
const { 
    getAddresses, 
    addAddress, 
    updateAddress, // Cần thêm hàm này vào Controller
    deleteAddress  // Cần thêm hàm này vào Controller
} = require('../controllers/addressController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Tất cả các thao tác với sổ địa chỉ đều yêu cầu phải đăng nhập
router.use(verifyToken);

// Chỉ Khách hàng (customer) mới có quyền quản lý sổ địa chỉ
router.get('/', requireRole('customer'), getAddresses);
router.post('/', requireRole('customer'), addAddress);

// --- 🚨 CÁC ROUTE CẦN BỔ SUNG ĐỂ SỬA LỖI 404 🚨 ---

// Route dùng để Cập nhật (Sửa) địa chỉ - Khớp với lỗi PUT /api/addresses/11 404
router.put('/:id', requireRole('customer'), updateAddress);

// Route dùng để Xóa địa chỉ
router.delete('/:id', requireRole('customer'), deleteAddress);

module.exports = router;