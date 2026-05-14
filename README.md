# Home Service Platform

Nền tảng quản lý dịch vụ nhà dân (sửa điện, sửa vòi nước, vệ sinh, ...) kết nối khách hàng và thợ lành nghề.

## Tổng quan

**Home Service Platform** là ứng dụng web fullstack giúp khách hàng tìm kiếm và đặt dịch vụ, đồng thời cho phép các thợ dân lập quản lý công việc và nhận đánh giá.

### Chức năng chính

#### Khách hàng (Customer)
- Đăng ký, đăng nhập tài khoản
- Xem danh sách dịch vụ
- Đặt lịch dịch vụ
- Quản lý sổ địa chỉ
- Đánh giá thợ sau khi hoàn thành công việc
- Theo dõi lịch sử đặt hàng

#### Thợ (Worker)
- Đăng ký tài khoản
- Upload tài liệu xác thực (CCCD, chứng chỉ)
- Chờ admin phê duyệt hồ sơ
- Nhận công việc từ khách hàng
- Cập nhật trạng thái công việc
- Xem đánh giá từ khách hàng

#### Admin
- Phê duyệt/từ chối hồ sơ thợ
- Quản lý danh sách dịch vụ
- Xem tất cả đơn hàng trong hệ thống
- Xử lý khiếu nại từ khách hàng
- Khóa tài khoản người dùng (nếu vi phạm)

## Cấu trúc dự án

```
home-service-platform/
│
├── database/                         # Cơ sở dữ liệu
│   ├── migrations/                   # File migration tạo bảng
│   ├── seeds/                        # Dữ liệu mẫu
│   ├── schema.sql                    # Schema tổng hợp
│   └── README.md
│
├── backend/                          # API Server (Node.js/Express)
│   ├── src/
│   │   ├── config/                   # Cấu hình (database, jwt...)
│   │   ├── controllers/              # Xử lý request logic
│   │   ├── models/                   # Database queries
│   │   ├── routes/                   # API endpoints
│   │   ├── middleware/               # Authentication, validation, upload
│   │   └── app.js
│   ├── server.js
│   ├── .env                          # Biến môi trường
│   ├── package.json
│   └── README.md
│
├── frontend/                         # Giao diện người dùng (React/Vue)
│   ├── public/
│   ├── src/
│   │   ├── assets/                   # Images, fonts, icons
│   │   ├── components/               # Reusable components
│   │   ├── pages/                    # Page components
│   │   │   ├── customer/
│   │   │   ├── worker/
│   │   │   └── admin/
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API calls
│   │   ├── store/                    # State management
│   │   ├── utils/                    # Helper functions
│   │   ├── layouts/                  # Layout components
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── docs/                             # Tài liệu dự án
└── README.md
```

## Công nghệ sử dụng

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer
- **Password Hashing**: Bcrypt
- **Data Validation**: Express Validator

### Frontend
- **Framework**: React hoặc Vue.js (tùy chọn)
- **State Management**: Redux/Zustand/Pinia
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap hoặc Tailwind CSS (tùy chọn)

## Cài đặt & Chạy

### Backend

```bash
cd backend
npm install
# Cấu hình .env file
npm run dev    # Chạy ở chế độ development
```

Xem [backend/README.md](backend/README.md) để hướng dẫn chi tiết.

### Database

```bash
# Import schema SQL
mysql -u root -p home_service_db < database/schema.sql
```

### Frontend

```bash
cd frontend
npm install
npm start      # Chạy ở chế độ development
```

Xem [frontend/README.md](frontend/README.md) để hướng dẫn chi tiết.

## API Documentation

Các endpoint API chính:

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Services
- `GET /api/services` - Danh sách dịch vụ
- `GET /api/services/:id` - Chi tiết dịch vụ

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng

### Profiles
- `GET /api/profiles` - Thông tin profile
- `POST /api/profiles/worker` - Upload tài liệu thợ

### Address Book
- `GET /api/address-book` - Danh sách địa chỉ
- `POST /api/address-book` - Thêm địa chỉ

### Reviews
- `POST /api/reviews` - Thêm đánh giá
- `GET /api/reviews/worker/:workerId` - Đánh giá của thợ

## Database Schema

Database gồm các bảng chính:
- **Users**: Thông tin người dùng
- **Profiles**: Hồ sơ chi tiết (tên, CCCD, chứng chỉ...)
- **Services**: Danh sách dịch vụ
- **Orders**: Đơn hàng/yêu cầu dịch vụ
- **AddressBook**: Sổ địa chỉ
- **Reviews**: Đánh giá
- **Notifications**: Thông báo

Chi tiết xem [database/README.md](database/README.md)

## Các vai trò và quyền

| Chức năng | Customer | Worker | Admin |
|----------|----------|--------|-------|
| Đặt dịch vụ | ✅ | ❌ | ✅ |
| Đánh giá | ✅ | ❌ | ❌ |
| Phê duyệt thợ | ❌ | ❌ | ✅ |
| Quản lý dịch vụ | ❌ | ❌ | ✅ |
| Xem đánh giá | ✅ | ✅ | ✅ |

## Biến môi trường

### Backend (.env)
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

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Hướng phát triển tiếp theo

- [ ] Tích hợp thanh toán (Stripe, PayPal)
- [ ] Thông báo realtime (WebSocket, Socket.io)
- [ ] Đặt lịch thợ tự động
- [ ] Xác định vị trí real-time (Google Maps)
- [ ] Tích hợp email/SMS
- [ ] Tích hợp cloud storage (AWS S3)
- [ ] Báo cáo và thống kê
- [ ] Mobile app (React Native)

## Liên hệ & Hỗ trợ

Liên hệ nhóm phát triển để được hỗ trợ hoặc báo cáo lỗi.

## License

MIT
