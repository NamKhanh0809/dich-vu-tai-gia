const { getAllUsers, updateUserLock, findUserById } = require('../models/userModel');
const { getAllPendingProfiles, updateApprovalStatus, getProfileByUserId } = require('../models/profileModel');
const { createNotification } = require('../models/notificationModel');
const { createService, updateService, softDeleteService, getServiceById } = require('../models/serviceModel');
const { getOrdersForReport, getOrderSummaryByStatus, getPendingOrders, approveOrder, rejectOrder, getOrderById } = require('../models/orderModel');
const { getAllComplaints, resolveComplaint, getComplaintById } = require('../models/complaintModel');
const pool = require('../config/database');
const csv = require('csv-parser');
const stream = require('stream');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// === User Management ===
// === User Management ===
const getUsers = async (req, res) => {
    try {
        const pool = require('../config/database');
        
        // Truy vấn lấy Khách hàng VÀ Thợ (nhưng thợ thì chỉ lấy người đã 'approved')
        // Kết hợp (JOIN) bảng profiles để lấy tên (full_name) và link ảnh
        const [users] = await pool.execute(`
            SELECT u.id, u.email, u.phone, u.role, u.is_locked,
                   p.full_name, p.approval_status, 
                   p.cccd_front_url, p.cccd_back_url, p.certificate_url
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'customer' 
               OR (u.role = 'worker' AND p.approval_status = 'approved')
            ORDER BY u.created_at DESC
        `);
        
        res.json(users);
    } catch (err) {
        console.error("LỖI LẤY DANH SÁCH USERS:", err);
        res.status(500).json({ message: err.message });
    }
};

// backend/src/controllers/adminController.js

const lockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_locked } = req.body; // true/false hoặc 0/1

        // Gọi đúng model đã có, tận dụng tên bảng chuẩn (Users)
        const affected = await updateUserLock(id, is_locked);
        if (affected === 0) return res.status(404).json({ message: 'User not found' });

        // Gửi thông báo (nếu muốn)
        const user = await findUserById(id);
        if (user) {
            const title = is_locked ? 'Account locked' : 'Account unlocked';
            await createNotification(id, title, `Your account has been ${is_locked ? 'locked' : 'unlocked'} by admin.`);
        }

        res.json({ message: `User ${is_locked ? 'locked' : 'unlocked'} successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === Profile Approval ===
const getPendingWorkers = async (req, res) => {
    try {
        const pending = await getAllPendingProfiles();
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === Phê duyệt thợ ===
// === Phê duyệt thợ ===
// === Phê duyệt thợ ===
const approveWorker = async (req, res) => {
    try {
        const { id } = req.params; // user_id của thợ
        
        const pendingDir = path.join(__dirname, `../../img/pending/worker_${id}`);
        const approvedDir = path.join(__dirname, `../../img/workers/worker_${id}`);

        // 1. Di chuyển thư mục ảnh từ pending sang workers (nếu thư mục có tồn tại)
        if (fs.existsSync(pendingDir)) {
            const workersBaseDir = path.join(__dirname, `../../img/workers`);
            if (!fs.existsSync(workersBaseDir)) {
                fs.mkdirSync(workersBaseDir, { recursive: true });
            }
            fs.renameSync(pendingDir, approvedDir);
        }

        // 2. Cập nhật trạng thái và tự động đổi đường dẫn '/img/pending/' thành '/img/workers/' cho cả 3 cột ảnh
        await pool.execute(`
            UPDATE profiles 
            SET approval_status = 'approved',
                cccd_front_url = REPLACE(cccd_front_url, '/img/pending/', '/img/workers/'),
                cccd_back_url = REPLACE(cccd_back_url, '/img/pending/', '/img/workers/'),
                certificate_url = REPLACE(certificate_url, '/img/pending/', '/img/workers/')
            WHERE user_id = ?
        `, [id]);
        
        // 3. Gửi thông báo cho thợ
        await createNotification(id, 'Profile approved', 'Hồ sơ ứng tuyển của bạn đã được duyệt. Bạn có thể bắt đầu nhận việc.');
        
        // 4. Gửi thông báo Real-time qua Socket.io (nếu có)
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${id}`).emit('profile_approved', { userId: id, approved: true });
        }
        
        res.json({ message: 'Đã phê duyệt hồ sơ thợ và di chuyển ảnh thành công' });
    } catch (err) {
        console.error("LỖI DUYỆT THỢ:", err);
        res.status(500).json({ message: err.message });
    }
};

// === Từ chối thợ ===
const rejectWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectReason, reason, reject_reason } = req.body; 
        const finalReason = rejectReason || reason || reject_reason || 'Không đáp ứng yêu cầu';

        // 1. Xóa toàn bộ thư mục rác trong khu cách ly
        const pendingDir = path.join(__dirname, `../../img/pending/worker_${id}`);
        if (fs.existsSync(pendingDir)) {
            // Lệnh rmSync với { recursive: true } sẽ xóa sạch toàn bộ thư mục và file bên trong
            fs.rmSync(pendingDir, { recursive: true, force: true });
        }

        // 2. Gọi model cập nhật trạng thái
        await updateApprovalStatus(id, 'rejected', finalReason);
        
        // Gửi thông báo
        await createNotification(id, 'Profile rejected', `Hồ sơ của bạn đã bị từ chối. Lý do: ${finalReason}`);
        
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${id}`).emit('profile_approved', { userId: id, approved: false });
        }
        
        res.json({ message: 'Đã từ chối hồ sơ thợ và dọn dẹp ảnh rác' });
    } catch (err) {
        console.error("LỖI TỪ CHỐI THỢ:", err);
        res.status(500).json({ message: err.message });
    }
};

// === Service Management ===
const addService = async (req, res) => {
    try {
        const { name, description, image_url, price_range, base_price } = req.body;
        // Kiểm tra unique name (có thể thêm ở model)
        const serviceId = await createService(name, description, image_url, price_range, base_price);
        res.status(201).json({ message: 'Service created', serviceId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Service name already exists' });
        res.status(500).json({ message: err.message });
    }
};

const editService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url, price_range, base_price } = req.body;
        const affected = await updateService(id, name, description, image_url, price_range, base_price);
        if (affected === 0) return res.status(404).json({ message: 'Service not found' });
        res.json({ message: 'Service updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await softDeleteService(id);
        res.json({ message: 'Service soft deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==== Báo cáo thống kê ====
const getOrderSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const summary = await getOrderSummaryByStatus(startDate, endDate);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOrdersReport = async (req, res) => {
    try {
        const { startDate, endDate, worker_id, status } = req.query;
        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (worker_id) filters.worker_id = worker_id;
        if (status) filters.status = status;
        const orders = await getOrdersForReport(filters);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==== Quản lý khiếu nại ====
const getComplaintsList = async (req, res) => {
    try {
        const { status } = req.query; // 'pending', 'resolved', 'refunded'
        const complaints = await getAllComplaints(status);
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const resolveComplaintHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution, action } = req.body; // action: 'resolve' or 'refund'
        if (!resolution || !action) {
            return res.status(400).json({ message: 'resolution and action are required' });
        }
        const newStatus = action === 'refund' ? 'refunded' : 'resolved';
        const affected = await resolveComplaint(id, resolution, newStatus);
        if (affected === 0) return res.status(404).json({ message: 'Complaint not found' });
        
        // Nếu action là refund, cập nhật trạng thái đơn hàng thành refunded
        const complaint = await getComplaintById(id);
        if (complaint && action === 'refund') {
            await pool.execute('UPDATE Orders SET status = "refunded" WHERE id = ?', [complaint.order_id]);
            // Thông báo cho khách hàng và thợ
            const order = await getOrderById(complaint.order_id);
            if (order) {
                await createNotification(order.customer_id, 'Refund processed', `Your order #${order.id} has been refunded.`, order.id);
                if (order.worker_id) {
                    await createNotification(order.worker_id, 'Refund processed', `Order #${order.id} has been refunded.`, order.id);
                }
            }
        }
        
        // Thông báo cho người khiếu nại
        await createNotification(complaint.complainant_id, 'Complaint resolved', `Your complaint #${id} has been ${newStatus}.`, complaint.order_id);
        
        res.json({ message: `Complaint ${newStatus} successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==== Phê duyệt đơn hàng ====
const getPendingOrdersList = async (req, res) => {
    try {
        const orders = await getPendingOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// backend/src/controllers/adminController.js

const approveOrderByAdmin = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params; // order_id
        
        // SỬA Ở ĐÂY: Hứng cả admin_note và adminNote, ép nó về null nếu không có
        // Điều này giúp MySQL không bao giờ bị dính lỗi "undefined"
        const { workerIds, admin_note, adminNote } = req.body; 
        const finalNote = admin_note || adminNote || null; 

        if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất một thợ' });
        }

        await connection.beginTransaction();

        // 1. Cập nhật trạng thái đơn hàng (Dùng finalNote)
        await connection.execute(
            'UPDATE orders SET status = "assigned", admin_note = ? WHERE id = ?',
            [finalNote, id]
        );

        // 2. Dọn sạch thợ cũ của đơn này trước (để tránh lỗi trùng lặp dữ liệu)
        await connection.execute('DELETE FROM order_workers WHERE order_id = ?', [id]);

        // 3. Chèn danh sách thợ mới vào bảng trung gian order_workers
        const workerQueries = workerIds.map(workerId => {
            return connection.execute(
                'INSERT INTO order_workers (order_id, worker_id) VALUES (?, ?)',
                [id, workerId]
            );
        });

        await Promise.all(workerQueries);

        await connection.commit();
        
        // Ghi chú: Nếu bạn có code gửi thông báo ở dưới thì cứ giữ nguyên nhé
        
        res.json({ message: 'Đã phê duyệt đơn hàng và phân công thợ' });
    } catch (err) {
        await connection.rollback();
        console.error("LỖI KHI PHÊ DUYỆT:", err); // In lỗi ra Terminal để dễ theo dõi
        res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
};
const { Readable } = require('stream'); // Đảm bảo đã import thư viện stream

const uploadServicesCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng tải lên một file CSV' });
        }

        // 1. Kiểm tra xem file có rỗng không (Quên lưu file)
        const fileString = req.file.buffer.toString('utf8');
        if (!fileString || fileString.trim() === '') {
            return res.status(400).json({ 
                message: 'File CSV của bạn đang trống (0 bytes). Vui lòng mở file, nhấn Lưu và tải lên lại!' 
            });
        }

        // 2. Tự động nhận diện dấu phân cách (Excel VN hay dùng dấu chấm phẩy)
        const separator = fileString.includes(';') ? ';' : ',';

        const results = [];
        
        // 3. Dùng Readable.from để đọc file mượt mà và an toàn nhất
        Readable.from(req.file.buffer)
            .pipe(csv({
                separator: separator, // Đưa dấu phân cách tự động vào đây
                mapHeaders: ({ header }) => header.trim().replace(/^[\uFEFF\xEF\xBB\xBF]+/, '') // Lọc sạch ký tự tàng hình BOM
            }))
            .on('data', (data) => {
                // Chỉ lấy dòng nào có chứa tên dịch vụ
                if (data.name || data['name']) {
                    results.push(data);
                }
            })
            .on('end', async () => {
                // Nếu sau khi đọc xong vẫn không có dòng nào
                if (results.length === 0) {
                    return res.status(400).json({ 
                        message: 'Không tìm thấy dữ liệu hợp lệ. Đảm bảo cột đầu tiên là "name".' 
                    });
                }

                let successCount = 0;
                let errorCount = 0;

                for (const item of results) {
                    try {
                        const name = item.name || '';
                        const description = item.description || '';
                        const image_url = item.image_url || null;
                        const price_range = item.price_range || '';
                        const base_price = item.base_price ? parseFloat(item.base_price) : 0;

                        if (name) {
                            await createService(name, description, image_url, price_range, base_price);
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error(`Lỗi thêm dịch vụ ${item.name}:`, err.message);
                        errorCount++; // Tăng lỗi nếu bị trùng tên trong Database
                    }
                }

                res.status(201).json({ 
                    message: `Xử lý hoàn tất. Thành công: ${successCount}, Thất bại/Trùng lặp: ${errorCount}` 
                });
            });
    } catch (err) {
        console.error("Lỗi Upload CSV:", err);
        res.status(500).json({ message: 'Lỗi máy chủ khi xử lý file' });
    }
};
const rejectOrderByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note } = req.body;
        if (!admin_note) {
            return res.status(400).json({ message: 'admin_note required (reason for rejection)' });
        }
        await rejectOrder(id, admin_note);
        
        const order = await getOrderById(id);
        if (order) {
            await createNotification(order.customer_id, 'Order rejected', `Your order #${id} has been rejected. Reason: ${admin_note}`, id);
            // Real-time socket
            const io = req.app.get('io');
            io.to(`user_${order.customer_id}`).emit('order_rejected', { orderId: id, reason: admin_note });
        }
        res.json({ message: 'Order cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getAdminStats = async (req, res) => {
    try {
        const pool = require('../config/database');

        // Lấy các chỉ số tổng quan (dùng SUM kết hợp CASE WHEN để đếm theo điều kiện)
        const [[stats]] = await pool.execute(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status IN ('pending', 'pending_approval') THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue,
                (SELECT COUNT(*) FROM profiles WHERE approval_status = 'pending') as pending_workers,
                (SELECT COUNT(*) FROM complaints WHERE status = 'pending') as pending_complaints
            FROM orders
        `);

        // Lấy 5 đơn hàng mới nhất
        const [recentOrders] = await pool.execute(`
            SELECT o.id, o.status, o.created_at, p.full_name as customer_name, 
                   GROUP_CONCAT(s.name SEPARATOR ', ') as service_name
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            JOIN profiles p ON u.id = p.user_id
            LEFT JOIN order_services os ON o.id = os.order_id
            LEFT JOIN services s ON os.service_id = s.id
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        res.json({
            ...stats,
            recent_orders: recentOrders
        });
    } catch (err) {
        console.error("LỖI DASHBOARD STATS:", err);
        res.status(500).json({ message: err.message });
    }
};

// ==== 2. Hàm lấy dữ liệu cho trang Báo Cáo (Reports) ====
const getReports = async (req, res) => {
    try {
        const pool = require('../config/database');

        // 2.1 Lấy thống kê của THÁNG NÀY
        const [[monthly]] = await pool.execute(`
            SELECT 
                COUNT(*) as new_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as revenue
            FROM orders
            WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
              AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);

        // 2.2 Dịch vụ được đặt nhiều nhất
        const [top_services] = await pool.execute(`
            SELECT s.id, s.name, COUNT(os.service_id) as count
            FROM order_services os
            JOIN services s ON os.service_id = s.id
            GROUP BY s.id, s.name
            ORDER BY count DESC
            LIMIT 5
        `);

        // 2.3 Xếp hạng Thợ theo Doanh Thu (chỉ tính đơn hoàn thành)
        const [top_workers] = await pool.execute(`
            SELECT 
                u.id, 
                p.full_name as name,
                COUNT(ow.order_id) as completed_orders,
                COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE worker_id = u.id), 0) as avg_rating,
                SUM(o.total_amount) as earnings
            FROM order_workers ow
            JOIN orders o ON ow.order_id = o.id
            JOIN users u ON ow.worker_id = u.id
            JOIN profiles p ON u.id = p.user_id
            WHERE o.status = 'completed'
            GROUP BY u.id, p.full_name
            ORDER BY earnings DESC
            LIMIT 10
        `);

        res.json({
            monthly: monthly || {},
            top_services: top_services || [],
            top_workers: top_workers || []
        });
    } catch (err) {
        console.error("LỖI REPORTS:", err);
        res.status(500).json({ message: err.message });
    }
};
const getAvailableWorkers = async (req, res) => {
    try {
        const pool = require('../config/database'); 
        
        // Dùng LEFT JOIN với bảng reviews và hàm AVG để tính trung bình cộng số sao
        const [workers] = await pool.execute(`
           SELECT 
                u.id, u.email, u.phone, 
                p.full_name, p.approval_status,
                COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                COUNT(r.id) as review_count
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            LEFT JOIN reviews r ON u.id = r.worker_id
            WHERE u.role = 'worker' 
              AND u.is_locked = 0 
              AND p.approval_status = 'approved'
            GROUP BY u.id, u.email, u.phone, p.full_name, p.approval_status
        `);
        res.json(workers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAdminStats,
    getReports,
    getUsers,
    lockUser,
    getPendingWorkers,
    approveWorker,
    addService,
    editService,
    deleteService,
    getOrderSummary,
    getOrdersReport,
    getComplaintsList,
    resolveComplaintHandler,
    getPendingOrdersList,
    approveOrderByAdmin,
    uploadServicesCSV,
   rejectOrderByAdmin,
   getAvailableWorkers,
   rejectWorker
};
