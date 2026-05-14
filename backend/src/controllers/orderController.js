const pool = require('../config/database'); // Import pool kết nối database
const { getOrdersByCustomer, getOrderById, updateOrderStatus } = require('../models/orderModel');
const { createNotification } = require('../models/notificationModel');
const { findUserById } = require('../models/userModel');

const createNewOrder = async (req, res) => {
    let connection;
    try {
        const customerId = req.user.id;
        // Lấy mảng serviceIds thay vì service_id đơn lẻ
        const { serviceIds, scheduled_datetime, address, note } = req.body;
        
        // Kiểm tra mảng serviceIds hợp lệ
        if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất một dịch vụ' });
        }

        // Kiểm tra thời gian không trong quá khứ
        if (new Date(scheduled_datetime) < new Date()) {
            return res.status(400).json({ message: 'Scheduled datetime cannot be in the past' });
        }
        
        // Bắt đầu Transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Lưu thông tin chung vào bảng orders (Trạng thái mặc định là pending_approval)
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (customer_id, scheduled_datetime, address, note, status) VALUES (?, ?, ?, ?, ?)',
            [customerId, scheduled_datetime, address, note || null, 'pending_approval']
        );
        
        const orderId = orderResult.insertId;

        // 2. Lưu danh sách dịch vụ vào bảng trung gian order_services
        const serviceQueries = serviceIds.map(serviceId => {
            return connection.execute(
                'INSERT INTO order_services (order_id, service_id) VALUES (?, ?)',
                [orderId, serviceId]
            );
        });
        
        // Chạy đồng thời tất cả câu lệnh INSERT dịch vụ
        await Promise.all(serviceQueries);

        // Lưu dữ liệu vào CSDL
        await connection.commit();
        
        // Gửi thông báo cho admin (giả sử admin có id = 1)
        await createNotification(1, 'New order pending', `Customer ${customerId} created order #${orderId}`, orderId);
        
        // Thông báo cho customer
        await createNotification(customerId, 'Order created', `Your order #${orderId} has been placed and pending approval`, orderId);
        
        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (err) {
        // Nếu có bất kỳ lỗi nào, hoàn tác lại toàn bộ (rollback)
        if (connection) await connection.rollback();
        console.error("Lỗi khi tạo đơn hàng:", err);
        res.status(500).json({ message: err.message });
    } finally {
        // Trả lại kết nối cho pool
        if (connection) connection.release();
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await getOrdersByCustomer(req.user.id);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Kiểm tra quyền: chỉ customer của order hoặc admin mới có thể xem
        if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customer_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Chỉ có thể hủy nếu status là pending_approval (Sửa lại cho đúng status trong DB của bạn)
        if (!['pending_approval', 'pending', 'assigned'].includes(order.status)) { 
            return res.status(400).json({ message: 'Cannot cancel this order' });
        }
        await updateOrderStatus(id, 'cancelled');
        res.json({ message: 'Order cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createNewOrder, getMyOrders, getOrderDetail, cancelOrder };