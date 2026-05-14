const express = require('express');
const { createNewOrder, getMyOrders, getOrderDetail, cancelOrder } = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { orderValidation } = require('../middleware/validationMiddleware');
const router = express.Router();

router.use(verifyToken);

// Customer routes
router.post('/', requireRole('customer'), orderValidation, createNewOrder);
router.get('/', requireRole('customer'), getMyOrders);
router.get('/:id', requireRole('customer'), getOrderDetail);
router.patch('/:id/cancel', requireRole('customer'), cancelOrder);

module.exports = router;
