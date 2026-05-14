# Frontend - Home Service Platform

Ứng dụng web Vue 3 + Vite cho nền tảng dịch vụ gia đình

## Công nghệ sử dụng

- **Vue 3** - Composition API
- **Vite** - Build tool
- **Vue Router 4** - Routing & navigation
- **Pinia** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Socket.IO** - Real-time notifications
- **Vee-validate + Yup** - Form validation

## Cấu trúc thư mục

```
src/
├── assets/          # CSS, hình ảnh
├── components/      # Vue components
├── layouts/         # Layout components
├── pages/           # Page views
│   ├── admin/       # Admin pages
│   ├── customer/    # Customer pages
│   └── worker/      # Worker pages
├── router/          # Vue Router config
├── services/        # API services
├── stores/          # Pinia stores
├── utils/           # Utilities (socket, helpers)
├── App.vue          # Root component
└── main.js          # Entry point
```

## Cài đặt & chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Chạy dev server

```bash
npm run dev
```

Truy cập `http://localhost:3000`

### 4. Build production

```bash
npm run build
```

## Các trang chính

### Public Pages
- `/` - Trang chủ
- `/services` - Danh sách dịch vụ
- `/services/:id` - Chi tiết dịch vụ
- `/price` - Bảng giá
- `/login` - Đăng nhập
- `/register` - Đăng ký khách
- `/worker-register` - Đăng ký thợ

### Customer Pages (Yêu cầu đăng nhập, role: customer)
- `/booking` - Đặt dịch vụ
- `/my-orders` - Đơn hàng của tôi
- `/my-orders/:id` - Chi tiết đơn hàng
- `/address-book` - Sổ địa chỉ

### Worker Pages (Yêu cầu đăng nhập, role: worker)
- `/worker/incoming` - Đơn được giao
- `/worker/history` - Lịch sử làm việc

### Admin Pages (Yêu cầu đăng nhập, role: admin)
- `/admin/dashboard` - Dashboard
- `/admin/orders/pending` - Đơn chờ duyệt
- `/admin/users` - Quản lý người dùng
- `/admin/worker-approvals` - Duyệt thợ
- `/admin/services` - Quản lý dịch vụ
- `/admin/complaints` - Khiếu nại
- `/admin/reports` - Báo cáo thống kê

## Stores (Pinia)

### auth.js
- state: `token`, `user`, `loading`, `error`
- actions: `login()`, `register()`, `fetchProfile()`, `logout()`
- getters: `isLoggedIn`, `userRole`

### notification.js
- state: `unreadCount`, `notifications`, `toasts`
- actions: `addNotification()`, `markAsRead()`, `success()`, `error()`, `info()`, `warning()`

## Services (API)

- `authService.js` - Đăng nhập, đăng ký, hồ sơ
- `orderService.js` - Đơn hàng, trạng thái
- `serviceService.js` - Dịch vụ, tìm kiếm
- `addressService.js` - Quản lý địa chỉ
- `reviewService.js` - Đánh giá
- `workerService.js` - Thợ, profil
- `adminService.js` - Quản lý, thống kê

## Socket.IO Events

### Từ server:
- `order_assigned` - Đơn được giao cho thợ
- `order_updated` - Cập nhật trạng thái đơn
- `notification` - Thông báo mới

### Gửi lên server:
- `register` - Đăng ký người dùng với socket

## Tailwind CSS Classes

Các custom classes được định nghĩa:
- `.btn-primary` - Nút chính (xanh dương)
- `.btn-secondary` - Nút phụ (xám)
- `.btn-danger` - Nút xóa (đỏ)
- `.btn-success` - Nút thành công (xanh)
- `.input-field` - Input field
- `.form-label` - Label form
- `.card` - Card container

## Troubleshooting

### API Connection Error
Đảm bảo backend chạy trên `http://localhost:5000` và các endpoint API đúng

### Socket.IO Connection Error
Kiểm tra `VITE_SOCKET_URL` trong `.env` trỏ đúng server Socket.IO

### Build Error
Xóa thư mục `node_modules` và `dist`, cài lại dependencies:
```bash
rm -rf node_modules dist
npm install
npm run build
```

## License

MIT
