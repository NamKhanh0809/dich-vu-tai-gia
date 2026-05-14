const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { getAssignedOrders, updateOrderStatus, getWorkHistory } = require('../controllers/workerOrderController');
const router = express.Router();
router.use(verifyToken, requireRole('worker'));
router.get('/orders', getAssignedOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/history', getWorkHistory);

module.exports = router;
