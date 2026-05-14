const { createReview, getReviewsByWorker, checkReviewExistsForOrder } = require('../models/reviewModel');
const { getOrderById } = require('../models/orderModel');

const addReview = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ Frontend gửi lên
        // Frontend gửi: { order_id, worker_id, rating, comment }
        const { order_id, worker_id, rating, comment } = req.body;
        
        // 2. Lấy ID khách hàng an toàn (tránh lỗi undefined)
        const customerId = req.user.userId || req.user.id;

        // 3. Kiểm tra đơn hàng
        const order = await getOrderById(order_id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        
        // Kiểm tra quyền (chỉ người đặt đơn mới được đánh giá)
        if (order.customer_id !== customerId) {
            return res.status(403).json({ message: 'Bạn không có quyền đánh giá đơn hàng này' });
        }

        // Kiểm tra trạng thái đơn
        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'Chỉ đơn hàng đã hoàn thành mới có thể đánh giá' });
        }

        // 4. KIỂM TRA QUAN TRỌNG: Đảm bảo worker_id tồn tại
        if (!worker_id) {
            return res.status(400).json({ message: 'Thiếu thông tin thợ cần đánh giá' });
        }

        // 5. Làm sạch dữ liệu trước khi đưa vào SQL
        const finalComment = comment || null; // Chuyển undefined thành null
        const finalRating = parseInt(rating) || 5;

        // 6. Thực hiện lưu vào Database
        // Lưu ý: Ta dùng worker_id từ req.body (do khách chọn thợ để đánh giá)
        await createReview(order_id, customerId, worker_id, finalRating, finalComment);
        
        res.status(201).json({ message: 'Gửi đánh giá thành công! Cảm ơn bạn.' });
    } catch (err) {
        console.error("LỖI ADD REVIEW:", err.message);
        res.status(500).json({ message: 'Lỗi server khi gửi đánh giá', error: err.message });
    }
};

const getWorkerReviews = async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const reviews = await getReviewsByWorker(workerId);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addReview, getWorkerReviews };