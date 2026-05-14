# Home Service Platform - Backend API

API Server cho nền tảng dịch vụ nhà dân (Home Service Platform) xây dựng bằng Node.js + Express + MySQL.

## Tính năng chính

- **Xác thực JWT**: Đăng ký, đăng nhập với email hoặc số điện thoại
- **Phân quyền**: Các vai trò (Customer, Worker, Admin)
- **Quản lý dịch vụ**: Xem danh sách dịch vụ, chi tiết dịch vụ
- **Quản lý đặt hàng**: Tạo, xem lịch sử đặt hàng
- **Sổ địa chỉ**: Thêm, xem danh sách địa chỉ giao hàng
- **Đánh giá**: Thợ được đánh giá sau khi hoàn thành công việc
- **Thông báo**: Hệ thống thông báo cho khách hàng và admin
- **Upload file**: Tải lên tài liệu (CCCD, chứng chỉ) cho thợ
- **Xác nhận hồ sơ**: Admin phê duyệt hồ sơ của thợ

## Cài đặt

### 1. Clone hoặc setup dự án

```bash
cd backend
```

### 2. Cài đặt các gói phụ thuộc

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend/`:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=home_service_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
```

**Lưu ý**: Thay đổi các giá trị phù hợp với cấu hình MySQL của bạn.

### 4. Chuẩn bị cơ sở dữ liệu

Đảm bảo MySQL đã chạy, sau đó tạo database và bảng theo file `database/schema.sql`.

```bash
mysql -u root -p < ../database/schema.sql
```

## Chạy ứng dụng

### Mode phát triển (với auto-reload)

```bash
npm run dev
```

### Mode sản xuất

```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## Cấu trúc dự án

```
backend/
├── server.js                    # Entry point
├── src/
│   ├── app.js                   # Express app setup
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/             # Xử lý request logic
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   ├── profileController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   └── reviewController.js
│   ├── middleware/              # Middleware xử lý
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── uploadMiddleware.js  # Multer file upload
│   │   └── validationMiddleware.js
│   ├── models/                  # Database queries
│   │   ├── userModel.js
│   │   ├── profileModel.js
│   │   ├── serviceModel.js
│   │   ├── orderModel.js
│   │   ├── addressModel.js
│   │   ├── reviewModel.js
│   │   └── notificationModel.js
│   └── routes/                  # API routes
│       ├── authRoutes.js
│       ├── serviceRoutes.js
│       ├── profileRoutes.js
│       ├── orderRoutes.js
│       ├── addressRoutes.js
│       └── reviewRoutes.js
├── uploads/                     # Folder lưu file upload
├── .env                         # Biến môi trường
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập

### Services
- `GET /api/services` - Lấy danh sách dịch vụ (Public)
- `GET /api/services/:id` - Lấy chi tiết dịch vụ (Public)

### Profile
- `GET /api/profiles` - Lấy thông tin profile (Authenticated)
- `POST /api/profiles/worker` - Upload tài liệu thợ (Worker + Authenticated)

### Orders
- `POST /api/orders` - Tạo đặt hàng (Customer + Authenticated)
- `GET /api/orders` - Lấy danh sách đặt hàng của khách (Customer + Authenticated)

### Address Book
- `GET /api/address-book` - Lấy danh sách địa chỉ (Customer + Authenticated)
- `POST /api/address-book` - Thêm địa chỉ (Customer + Authenticated)

### Reviews
- `POST /api/reviews` - Thêm đánh giá (Customer + Authenticated)
- `GET /api/reviews/worker/:workerId` - Lấy đánh giá của thợ (Public)

### Worker Routes (Thợ)
- `GET /api/worker/orders` - Lấy danh sách đơn assigned (Worker + Authenticated)
- `PATCH /api/worker/orders/:id/status` - Cập nhật trạng thái đơn (Worker + Authenticated)
- `GET /api/worker/history` - Lịch sử công việc + tổng thu nhập (Worker + Authenticated)

### Admin Routes (Quản trị)
- `GET /api/admin/users` - Lấy danh sách users (Admin + Authenticated)
- `PATCH /api/admin/users/:id/lock` - Khóa/mở khóa tài khoản (Admin + Authenticated)
- `GET /api/admin/workers/pending` - Lấy danh sách thợ chờ phê duyệt (Admin + Authenticated)
- `PATCH /api/admin/profiles/:id/approve` - Phê duyệt/từ chối hồ sơ (Admin + Authenticated)
- `POST /api/admin/services` - Tạo dịch vụ (Admin + Authenticated)
- `PUT /api/admin/services/:id` - Cập nhật dịch vụ (Admin + Authenticated)
- `DELETE /api/admin/services/:id` - Xóa dịch vụ (Admin + Authenticated)
- `GET /api/admin/reports/orders/summary` - Thống kê đơn hàng (Admin + Authenticated)
- `GET /api/admin/reports/orders/list` - Chi tiết danh sách đơn (Admin + Authenticated)
- `GET /api/admin/complaints` - Danh sách khiếu nại (Admin + Authenticated)
- `PATCH /api/admin/complaints/:id/resolve` - Giải quyết khiếu nại (Admin + Authenticated)
- `GET /api/admin/orders/pending` - Đơn chờ phê duyệt (Admin + Authenticated)
- `PATCH /api/admin/orders/:id/approve` - Phê duyệt đơn (Admin + Authenticated)
- `PATCH /api/admin/orders/:id/reject` - Từ chối đơn (Admin + Authenticated)

## Xác thực (Authentication)

API sử dụng JWT token trong `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Token được cấp sau khi đăng nhập thành công.

## API Tài Liệu Chi Tiết

### Real-Time & Advanced Features
- **Socket.io**: Xem [SOCKET_IO_SETUP.md](SOCKET_IO_SETUP.md)
- **Worker Orders**: Xem [ENHANCEMENTS.md](ENHANCEMENTS.md)
- **Admin Advanced**: Xem [ADMIN_ADVANCED_FEATURES.md](ADMIN_ADVANCED_FEATURES.md)

### Testing
Xem [TESTING_GUIDE.md](TESTING_GUIDE.md) để test từng endpoint

## Ghi chú

- File được upload tạm thời lưu trong thư mục `/uploads`, có thể thay bằng cloud storage (AWS S3, Google Cloud Storage) sau
- JWT secret key trong `.env` nên được thay đổi cho môi trường sản xuất
- Đảm bảo MySQL database đã được khởi tạo với các bảng từ `database/schema.sql`

## Dependencies

- **express**: Web framework
- **socket.io**: Real-time communication
- **mysql2/promise**: MySQL driver with Promise support
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **multer**: File upload handling
- **cors**: Cross-Origin Resource Sharing
- **helmet**: HTTP security headers
- **morgan**: HTTP request logger
- **express-validator**: Data validation
- **dotenv**: Environment variables management

## Troubleshooting

1. **Connection refused error**: Kiểm tra MySQL đã chạy và cấu hình `.env` đúng
2. **Port already in use**: Thay đổi PORT trong `.env` hoặc dừng process dùng port 5000
3. **Database errors**: Đảm bảo database đã được tạo và schema.sql đã được import

## Tác giả

Home Service Platform Team
