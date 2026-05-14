const pool = require('../config/database');

// Thay thế hàm createOrder cũ bằng hàm này:
const createOrder = async (customerId, serviceIds, scheduledDatetime, address, note) => {
    const connection = await pool.getConnection(); // Dùng transaction để đảm bảo an toàn dữ liệu
    try {
        await connection.beginTransaction();

        // 1. Tạo đơn hàng trong bảng orders (Đã bỏ cột service_id đi)
        const [orderResult] = await connection.execute(
            `INSERT INTO orders (customer_id, scheduled_datetime, address, note, status)
             VALUES (?, ?, ?, ?, 'pending_approval')`,
            [customerId, scheduledDatetime, address, note]
        );
        const orderId = orderResult.insertId;

        // 2. Chèn các dịch vụ khách chọn vào bảng trung gian order_services
        for (const serviceId of serviceIds) {
            await connection.execute(
                `INSERT INTO order_services (order_id, service_id) VALUES (?, ?)`,
                [orderId, serviceId]
            );
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback(); // Nếu lỗi thì hủy bỏ toàn bộ thao tác
        throw error;
    } finally {
        connection.release();
    }
};
const getOrdersByCustomer = async (customerId) => {
    const [rows] = await pool.execute(
        `SELECT o.*, 
                GROUP_CONCAT(DISTINCT p.full_name SEPARATOR ', ') as worker_names,
                GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as service_name
         FROM orders o
         LEFT JOIN order_workers ow ON o.id = ow.order_id
         LEFT JOIN profiles p ON ow.worker_id = p.user_id
         LEFT JOIN order_services os ON o.id = os.order_id
         LEFT JOIN services s ON os.service_id = s.id
         WHERE o.customer_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [customerId]
    );
    return rows;
};

const getOrderById = async (orderId) => {
    const pool = require('../config/database');
    
    // 1. Lấy thông tin chung của đơn hàng
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return null;
    let order = orders[0];

    // 2. Lấy danh sách dịch vụ của đơn này (Gom từ bảng order_services và services)
    const [services] = await pool.execute(`
        SELECT s.id, s.name, s.base_price 
        FROM services s 
        JOIN order_services os ON s.id = os.service_id 
        WHERE os.order_id = ?
    `, [orderId]);
    order.services = services; // Gắn mảng dịch vụ vào object order

    // 3. Lấy danh sách thợ đã được phân công cho đơn này
   // 3. Lấy danh sách thợ đã được phân công cho đơn này (Đã thêm logic tính sao)
    const [workers] = await pool.execute(`
        SELECT u.id as worker_id, p.full_name, u.phone,
               COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE worker_id = u.id), 0) as avg_rating
        FROM users u 
        JOIN profiles p ON u.id = p.user_id 
        JOIN order_workers ow ON u.id = ow.worker_id 
        WHERE ow.order_id = ?
    `, [orderId]);
    order.workers = workers; // Gắn mảng thợ vào object order
    
    return order;
};

const updateOrderStatus = async (orderId, status, workerId = null) => {
    if (workerId) {
        await pool.execute('UPDATE orders SET status = ?, worker_id = ? WHERE id = ?', [status, workerId, orderId]);
    } else {
        await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    }
};

const getOrdersByWorker = async (workerId, status = null) => {
    let query = 'SELECT * FROM orders WHERE worker_id = ?';
    const params = [workerId];
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    query += ' ORDER BY scheduled_datetime ASC';
    const [rows] = await pool.execute(query, params);
    return rows;
};

const getWorkerOrdersWithCustomer = async (workerId, status) => {
    const [rows] = await pool.execute(
        `SELECT o.*, 
                u.email as customer_email, u.phone as customer_phone,
                p.full_name as customer_name,
                GROUP_CONCAT(s.name SEPARATOR ', ') as service_name
         FROM orders o
         JOIN order_workers ow ON o.id = ow.order_id
         JOIN users u ON o.customer_id = u.id
         JOIN profiles p ON u.id = p.user_id
         LEFT JOIN order_services os ON o.id = os.order_id
         LEFT JOIN services s ON os.service_id = s.id
         WHERE ow.worker_id = ? AND o.status = ?
         GROUP BY o.id
         ORDER BY o.scheduled_datetime ASC`,
        [workerId, status]
    );
    return rows;
};

const getWorkerHistory = async (workerId, page = 1, limit = 10) => {
    // 1. Ép kiểu dữ liệu về số nguyên (Cực kỳ quan trọng)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offsetNum = (pageNum - 1) * limitNum;

    // 2. Sửa o.updated_at thành o.created_at (nếu DB bạn không có updated_at)
    const [rows] = await pool.execute(
        `SELECT o.*, 
                u.email as customer_email, u.phone as customer_phone,
                p.full_name as customer_name,
                GROUP_CONCAT(s.name SEPARATOR ', ') as service_name
         FROM orders o
         JOIN order_workers ow ON o.id = ow.order_id
         JOIN users u ON o.customer_id = u.id
         JOIN profiles p ON u.id = p.user_id
         LEFT JOIN order_services os ON o.id = os.order_id
         LEFT JOIN services s ON os.service_id = s.id
         WHERE ow.worker_id = ? AND o.status IN ('completed', 'cancelled')
         GROUP BY o.id
         ORDER BY o.created_at DESC 
         LIMIT ? OFFSET ?`,
        [workerId, limitNum, offsetNum] // Truyền số nguyên vào đây
    );
    
    const [countResult] = await pool.execute(
        `SELECT COUNT(DISTINCT o.id) as total 
         FROM orders o 
         JOIN order_workers ow ON o.id = ow.order_id 
         WHERE ow.worker_id = ? AND o.status IN ("completed", "cancelled")`,
        [workerId]
    );
    
    return {
        orders: rows,
        total: countResult[0].total,
        page: pageNum,
        limit: limitNum
    };
};

const getTotalEarnings = async (workerId) => {
    const [rows] = await pool.execute(
        `SELECT SUM(o.total_amount) as total 
         FROM orders o 
         JOIN order_workers ow ON o.id = ow.order_id 
         WHERE ow.worker_id = ? AND o.status = "completed"`,
        [workerId]
    );
    return rows[0].total || 0;
};

const updateOrderStatusAndGet = async (orderId, newStatus, workerId = null) => {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    return rows[0];
};

// Admin: Lấy danh sách đơn hàng theo nhiều điều kiện (ngày, worker_id)
const getOrdersForReport = async (filters) => {
    let query = `
        SELECT o.*, 
               c.email as customer_email, c.phone as customer_phone,
               p_c.full_name as customer_name,
               w.email as worker_email, w.phone as worker_phone,
               p_w.full_name as worker_name,
               s.name as service_name
        FROM orders o
        JOIN users c ON o.customer_id = c.id
        JOIN profiles p_c ON c.id = p_c.user_id
        LEFT JOIN users w ON o.worker_id = w.id
        LEFT JOIN profiles p_w ON w.id = p_w.user_id
        JOIN services s ON o.service_id = s.id
        WHERE 1=1
    `;
    const params = [];
    
    if (filters.startDate) {
        query += ' AND o.scheduled_datetime >= ?';
        params.push(filters.startDate);
    }
    if (filters.endDate) {
        query += ' AND o.scheduled_datetime <= ?';
        params.push(filters.endDate);
    }
    if (filters.worker_id) {
        query += ' AND o.worker_id = ?';
        params.push(filters.worker_id);
    }
    if (filters.status) {
        query += ' AND o.status = ?';
        params.push(filters.status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
};

// Admin: Thống kê số lượng đơn theo trạng thái (có thể lọc theo khoảng thời gian)
const getOrderSummaryByStatus = async (startDate = null, endDate = null) => {
    let query = 'SELECT status, COUNT(*) as count FROM orders WHERE 1=1';
    const params = [];
    if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
    }
    if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
    }
    query += ' GROUP BY status';
    const [rows] = await pool.execute(query, params);
    return rows;
};

// Admin: Lấy danh sách đơn pending_approval
// Admin: Lấy danh sách đơn pending_approval
const getPendingOrders = async () => {
    const [rows] = await pool.execute(
        `SELECT o.*, 
                u.email as customer_email, u.phone as customer_phone,
                p.full_name as customer_name,
                GROUP_CONCAT(s.name SEPARATOR ', ') as service_name
         FROM orders o
         JOIN users u ON o.customer_id = u.id
         JOIN profiles p ON u.id = p.user_id
         LEFT JOIN order_services os ON o.id = os.order_id
         LEFT JOIN services s ON os.service_id = s.id
         WHERE o.status = 'pending_approval'
         GROUP BY o.id
         ORDER BY o.created_at ASC`
    );
    return rows;
};

// Admin: Phê duyệt đơn (gán thợ và chuyển status)
const approveOrder = async (orderId, workerIds, adminNote = null) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cập nhật trạng thái bảng orders
        await connection.execute(
            'UPDATE orders SET status = "assigned", admin_note = ? WHERE id = ?',
            [adminNote, orderId]
        );

        // 2. Dọn sạch thợ cũ của đơn này (nếu có)
        await connection.execute('DELETE FROM order_workers WHERE order_id = ?', [orderId]);

        // 3. Insert danh sách thợ mới
        // Đảm bảo workerIds là mảng trước khi chạy vòng lặp
        const workers = Array.isArray(workerIds) ? workerIds : [workerIds];
        for (const wId of workers) {
            await connection.execute(
                'INSERT INTO order_workers (order_id, worker_id) VALUES (?, ?)',
                [orderId, wId]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
// Admin: Từ chối đơn (cập nhật admin_note)
const rejectOrder = async (orderId, adminNote) => {
    await pool.execute(
        'UPDATE orders SET status = "cancelled", admin_note = ? WHERE id = ?',
        [adminNote, orderId]
    );
};
const isWorkerAssignedToOrder = async (orderId, workerId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM order_workers WHERE order_id = ? AND worker_id = ?', 
        [orderId, workerId]
    );
    return rows.length > 0;
};
module.exports = { 
    createOrder, 
    getOrdersByCustomer, 
    getOrderById, 
    updateOrderStatus, 
    getOrdersByWorker, 
    getWorkerOrdersWithCustomer, 
    getWorkerHistory, 
    getTotalEarnings, 
    updateOrderStatusAndGet, 
    getOrdersForReport, 
    getOrderSummaryByStatus, 
    getPendingOrders, 
    approveOrder, 
    rejectOrder,
    isWorkerAssignedToOrder
};