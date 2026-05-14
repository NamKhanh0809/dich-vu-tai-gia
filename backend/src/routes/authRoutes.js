const express = require('express');
const router = express.Router();

// 1. GỌI TRỰC TIẾP MULTER VÀO ĐÂY (Thay vì dùng config cũ)
const multer = require('multer');

// Cấu hình Multer sử dụng bộ nhớ tạm (RAM)
const upload = multer({ storage: multer.memoryStorage() });

// Khai báo chính xác các file Frontend gửi lên
const uploadFields = upload.fields([
    { name: 'cccd_front', maxCount: 1 },
    { name: 'cccd_back', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]);

// 2. Import controller
const { register, login, registerWorker } = require('../controllers/authController');

// 3. Khai báo routes
router.post('/register', register);
router.post('/login', login);

// Lắp "chốt kiểm tra" uploadFields vào
router.post('/register-worker', uploadFields, registerWorker);

module.exports = router;