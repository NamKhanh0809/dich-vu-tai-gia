const { 
    getWorkerOrdersWithCustomer, 
    updateOrderStatusAndGet, 
    getWorkerHistory, 
    getTotalEarnings, 
    getOrderById,
    isWorkerAssignedToOrder // THÊM HÀM NÀY
} = require('../models/orderModel');
const { createNotification } = require('../models/notificationModel');
const { getProfileByUserId } = require('../models/profileModel');
const pool = require('../config/database'); // Thêm dòng này lên đầu file
// Lấy danh sách đơn đã assigned cho thợ hiện tại
const getAssignedOrders = async (req, res) => {
    try {
        const workerId = req.user.id;
        const orders = await getWorkerOrdersWithCustomer(workerId, 'assigned');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cập nhật trạng thái đơn hàng (assigned -> in_progress -> completed)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        const workerId = req.user.id;
        
        // Lấy thông tin đơn hàng
        const order = await getOrderById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // MỚI: Kiểm tra thợ này có được giao cho đơn hàng này qua bảng order_workers không
        const isAssigned = await isWorkerAssignedToOrder(id, workerId);
        if (!isAssigned) return res.status(403).json({ message: 'Not your order' });
        
        if (order.status === 'assigned' && status !== 'in_progress') {
            return res.status(400).json({ message: 'Can only change to in_progress from assigned' });
        }
        if (order.status === 'in_progress' && status !== 'completed') {
            return res.status(400).json({ message: 'Can only change to completed from in_progress' });
        }
        if (order.status !== 'assigned' && order.status !== 'in_progress') {
            return res.status(400).json({ message: 'Invalid current status' });
        }
        
        const updatedOrder = await updateOrderStatusAndGet(id, status);
        
        const io = req.app.get('io');
        const notificationTitle = `Order #${id} status changed to ${status}`;
        await createNotification(order.customer_id, notificationTitle, `Your order has been updated to ${status}`, id);
        // Tự động tìm ID của Admin
const [adminUsers] = await pool.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
if (adminUsers.length > 0) {
    const adminId = adminUsers[0].id;
    // Gửi thông báo và socket cho đúng ID của admin
    await createNotification(adminId, notificationTitle, `Order #${id} is now ${status}`, id);
    io.to(`user_${adminId}`).emit('order_status_updated', { orderId: id, status });
}
        
        res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lịch sử công việc + tổng thu nhập
const getWorkHistory = async (req, res) => {
    try {
        const workerId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const history = await getWorkerHistory(workerId, page, limit);
        const totalEarnings = await getTotalEarnings(workerId);
        res.json({ history, totalEarnings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAssignedOrders,
    updateOrderStatus,
    getWorkHistory
};
