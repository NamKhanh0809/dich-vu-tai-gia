const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const registerValidation = [
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('role').optional().isIn(['customer', 'worker']).withMessage('Role must be customer or worker'),
    validate
];

const loginValidation = [
    body('identifier').notEmpty().withMessage('Email or phone required'),
    body('password').notEmpty().withMessage('Password required'),
    validate
];

const orderValidation = [
    // SỬA Ở ĐÂY: Yêu cầu serviceIds phải là mảng và có ít nhất 1 phần tử
    body('serviceIds').isArray({ min: 1 }).withMessage('Vui lòng chọn ít nhất một dịch vụ'),
    // Kiểm tra từng phần tử bên trong mảng phải là số nguyên (ID hợp lệ)
    body('serviceIds.*').isInt().withMessage('Invalid service id in array'),
    
    // Các trường khác giữ nguyên
    body('scheduled_datetime').isISO8601().withMessage('Invalid datetime'),
    body('address').notEmpty().withMessage('Address required'),
    body('note').optional().isString(),
    validate
];

module.exports = { registerValidation, loginValidation, orderValidation };