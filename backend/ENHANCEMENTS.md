# Backend Enhancement - Socket.io & Advanced Features

## 📋 Tóm tắt các thay đổi

### 1. Socket.io Real-Time Communication
- ✅ Cấu hình Socket.io server trong `server.js`
- ✅ Hỗ trợ các sự kiện:
  - `order_status_updated` - Thay đổi trạng thái đơn hàng
  - `profile_approved` - Phê duyệt hồ sơ thợ
  - `register` - Đăng ký user vào room riêng

### 2. Model Enhancements

#### orderModel.js (thêm 5 hàm mới)
- `getOrdersByWorker()` - Lấy đơn của thợ theo status
- `getWorkerOrdersWithCustomer()` - Lấy đơn kèm thông tin khách
- `getWorkerHistory()` - Lịch sử công việc (pagination)
- `getTotalEarnings()` - Tính tổng thu nhập của thợ
- `updateOrderStatusAndGet()` - Cập nhật và trả về đơn hàng

#### userModel.js (thêm 2 hàm mới)
- `getAllUsers()` - Lấy danh sách users với filter role
- `updateUserLock()` - Khóa/mở khóa tài khoản

#### profileModel.js (thêm 2 hàm mới)
- `getAllPendingProfiles()` - Lấy thợ chờ phê duyệt
- `updateApprovalStatus()` - Cập nhật trạng thái phê duyệt

#### serviceModel.js (thêm 3 hàm mới)
- `createService()` - Tạo dịch vụ mới
- `updateService()` - Cập nhật dịch vụ
- `softDeleteService()` - Xóa mềm dịch vụ

#### notificationModel.js (thêm 2 hàm mới)
- `getUnreadNotifications()` - Lấy thông báo chưa đọc
- `markAsRead()` - Đánh dấu đã đọc

### 3. Controllers mới

#### workerOrderController.js
Quản lý đơn hàng cho thợ:
- `getAssignedOrders()` - Lấy danh sách đơn được gán
- `updateOrderStatus()` - Cập nhật trạng thái (assigned → in_progress → completed)
- `getWorkHistory()` - Xem lịch sử + tổng thu nhập

#### adminController.js
Quản lý user, phê duyệt thợ, quản lý dịch vụ:
- `getUsers()` - Danh sách users (có filter role)
- `lockUser()` - Khóa/mở khóa tài khoản
- `getPendingWorkers()` - Danh sách thợ chờ phê duyệt
- `approveWorker()` - Phê duyệt/từ chối hồ sơ
- `addService()` - Thêm dịch vụ
- `editService()` - Sửa dịch vụ
- `deleteService()` - Xóa dịch vụ

### 4. Routes mới

#### /api/worker/* (Worker routes)
```
GET    /api/worker/orders              - Lấy đơn assigned
PATCH  /api/worker/orders/:id/status   - Cập nhật trạng thái
GET    /api/worker/history             - Lịch sử + thu nhập
```

#### /api/admin/* (Admin routes)
```
GET    /api/admin/users                       - Danh sách users
PATCH  /api/admin/users/:id/lock              - Khóa user
GET    /api/admin/workers/pending             - Thợ chờ phê duyệt
PATCH  /api/admin/profiles/:id/approve        - Phê duyệt hồ sơ
POST   /api/admin/services                    - Tạo dịch vụ
PUT    /api/admin/services/:id                - Sửa dịch vụ
DELETE /api/admin/services/:id                - Xóa dịch vụ
```

### 5. File cấu hình

- ✅ `package.json` - Thêm `socket.io`
- ✅ `server.js` - Khởi tạo HTTP server & Socket.io
- ✅ `src/app.js` - Import routes mới

### 6. Tài liệu

- ✅ `SOCKET_IO_SETUP.md` - Hướng dẫn Chi tiết Socket.io
- ✅ `README.md` - Cập nhật API endpoints & dependencies

## 📦 Cài đặt

```bash
cd backend
npm install
npm run dev
```

## 🔌 Socket.io Setup (Client side)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    const userId = localStorage.getItem('userId');
    socket.emit('register', userId);
});

socket.on('order_status_updated', (data) => {
    console.log(`Order #${data.orderId} is now ${data.status}`);
});

socket.on('profile_approved', (data) => {
    console.log(`Profile approved: ${data.approved}`);
});
```

## 📊 Cấu trúc Backend hiện tại

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   ├── profileController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   ├── reviewController.js
│   │   ├── workerOrderController.js ⭐ MỚI
│   │   └── adminController.js ⭐ MỚI
│   ├── models/
│   │   ├── userModel.js (↑ CẬP NHẬT)
│   │   ├── profileModel.js (↑ CẬP NHẬT)
│   │   ├── serviceModel.js (↑ CẬP NHẬT)
│   │   ├── orderModel.js (↑ CẬP NHẬT)
│   │   ├── addressModel.js
│   │   ├── reviewModel.js
│   │   └── notificationModel.js (↑ CẬP NHẬT)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── addressRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── workerRoutes.js ⭐ MỚI
│   │   └── adminRoutes.js ⭐ MỚI
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── validationMiddleware.js
│   ├── config/
│   │   └── database.js
│   └── app.js (↑ CẬP NHẬT)
├── server.js (↑ CẬP NHẬT)
├── package.json (↑ CẬP NHẬT)
├── .env
├── README.md (↑ CẬP NHẬT)
└── SOCKET_IO_SETUP.md ⭐ MỚI
```

## 🔐 Kiểm tra quyền (Role-based)

| Endpoint | Customer | Worker | Admin |
|----------|----------|--------|-------|
| POST /api/orders | ✅ | ❌ | ✅ |
| GET /api/worker/orders | ❌ | ✅ | ❌ |
| PATCH /api/worker/orders/*/status | ❌ | ✅ | ❌ |
| GET /api/admin/* | ❌ | ❌ | ✅ |
| PATCH /api/admin/* | ❌ | ❌ | ✅ |

## 🧪 Thử nghiệm

### 1. Test Admin API (Postman)

```bash
# 1. Login as admin
POST http://localhost:5000/api/auth/login
{
  "identifier": "admin@email.com",
  "password": "password123"
}

# 2. Get all users
GET http://localhost:5000/api/admin/users
Headers: Authorization: Bearer <token>

# 3. Get pending workers
GET http://localhost:5000/api/admin/workers/pending
Headers: Authorization: Bearer <token>
```

### 2. Test Worker API

```bash
# 1. Login as worker
POST http://localhost:5000/api/auth/login

# 2. Get assigned orders
GET http://localhost:5000/api/worker/orders
Headers: Authorization: Bearer <token>

# 3. Update order status
PATCH http://localhost:5000/api/worker/orders/1/status
Headers: Authorization: Bearer <token>
Body: { "status": "in_progress" }
```

### 3. Test Socket.io Events

Dùng Chrome DevTools hoặc Socket.io test client:
- Connect tới server
- Emit 'register' event với userId
- Thay đổi order status để nhận event real-time

## 📝 Lưu ý quan trọng

1. **CORS**: Hiện set `origin: "*"`, nên change thành domain cụ thể khi production
2. **Admin ID**: Default admin ID là 1 (khi tạo notifications), có thể config lại
3. **File Upload**: Tạm lưu trong `/uploads`, nên migrate sang cloud storage
4. **Database**: Đảm bảo bảng `Notifications` có cột `is_read` và `updated_at`

## 🚀 Tiếp theo

- [ ] Tích hợp payment gateway (Stripe/PayPal)
- [ ] Real-time chat giữa customer và worker
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Email notifications (Nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] Batch job xử lý đơn hàng quá hạn
- [ ] Caching (Redis)
- [ ] API rate limiting
- [ ] Error tracking (Sentry)
