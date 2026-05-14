# Socket.io Real-Time Setup

## Tổng quan

Socket.io được sử dụng để gửi các thông báo real-time tới các client khi:
- Trạng thái đơn hàng thay đổi
- Hồ sơ thợ được phê duyệt
- Khách hàng nhận được thông báo

## Cấu hình Server

### 1. Khởi tạo Socket.io (server.js)

```javascript
const io = new Server(server, {
    cors: {
        origin: "*", // Thay bằng domain thật khi production
        methods: ["GET", "POST"]
    }
});

app.set('io', io);
```

### 2. Xử lý Connection

```javascript
io.on('connection', (socket) => {
    // Register user vào room riêng
    socket.on('register', (userId) => {
        socket.join(`user_${userId}`);
    });
    
    socket.on('disconnect', () => {
        // Client ngắt kết nối
    });
});
```

## Cấu hình Client (Frontend)

### 1. Cài đặt Socket.io Client

```bash
npm install socket.io-client
```

### 2. Kết nối và Đăng ký

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
    auth: {
        token: localStorage.getItem('token')
    }
});

// Đăng ký user vào phòng riêng
socket.on('connect', () => {
    const userId = localStorage.getItem('userId');
    socket.emit('register', userId);
});

// Lắng nghe sự kiện order_status_updated
socket.on('order_status_updated', (data) => {
    console.log(`Order #${data.orderId} is now ${data.status}`);
    // Cập nhật UI
});

// Lắng nghe sự kiện profile_approved
socket.on('profile_approved', (data) => {
    console.log(`Profile ${data.approved ? 'approved' : 'rejected'}`);
    // Cập nhật UI
});
```

## Events Server emit

### order_status_updated
Gửi tới: Khách hàng và Admin

```javascript
io.to(`user_${customerId}`).emit('order_status_updated', { 
    orderId: 123, 
    status: 'in_progress' 
});
```

### profile_approved
Gửi tới: Thợ đó

```javascript
io.to(`user_${workerId}`).emit('profile_approved', { 
    userId: 123, 
    approved: true 
});
```

## Các API Endpoint mới

### Worker Routes (`/api/worker`)

**GET /api/worker/orders** - Lấy danh sách đơn assigned
- Header: `Authorization: Bearer <token>`
- Role: `worker`
- Response:
```json
[
  {
    "id": 1,
    "customer_email": "customer@email.com",
    "customer_phone": "0123456789",
    "customer_name": "Nguyễn Văn A",
    "address": "123 Đường Lý Thường Kiệt, TP.HCM",
    "status": "assigned"
  }
]
```

**PATCH /api/worker/orders/:id/status** - Cập nhật trạng thái đơn
- Header: `Authorization: Bearer <token>`
- Role: `worker`
- Body:
```json
{
  "status": "in_progress"  // hoặc "completed"
}
```

**GET /api/worker/history** - Lịch sử công việc + tổng thu nhập
- Header: `Authorization: Bearer <token>`
- Role: `worker`
- Query params: `page=1&limit=10` (tùy chọn)
- Response:
```json
{
  "history": {
    "orders": [...],
    "total": 50,
    "page": 1,
    "limit": 10
  },
  "totalEarnings": 15000000
}
```

### Admin Routes (`/api/admin`)

**GET /api/admin/users** - Lấy danh sách users
- Header: `Authorization: Bearer <token>`
- Role: `admin`
- Query params: `role=customer` (tùy chọn: customer, worker, admin)
- Response:
```json
[
  {
    "id": 1,
    "email": "user@email.com",
    "phone": "0123456789",
    "role": "customer",
    "is_locked": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**PATCH /api/admin/users/:id/lock** - Khóa/mở khóa tài khoản
- Header: `Authorization: Bearer <token>`
- Role: `admin`
- Body:
```json
{
  "is_locked": true  // true = khóa, false = mở khóa
}
```

**GET /api/admin/workers/pending** - Lấy danh sách thợ chờ phê duyệt
- Header: `Authorization: Bearer <token>`
- Role: `admin`
- Response:
```json
[
  {
    "user_id": 5,
    "full_name": "Nguyễn Văn B",
    "approval_status": "pending",
    "cccd_front_url": "/uploads/file-123.jpg",
    "cccd_back_url": "/uploads/file-124.jpg",
    "certificate_url": "/uploads/file-125.pdf",
    "email": "worker@email.com",
    "phone": "0987654321"
  }
]
```

**PATCH /api/admin/profiles/:id/approve** - Phê duyệt/từ chối hồ sơ thợ
- Header: `Authorization: Bearer <token>`
- Role: `admin`
- Body:
```json
{
  "approved": true,  // true = phê duyệt, false = từ chối
  "reject_reason": "Tài liệu không rõ ràng"  // bắt buộc nếu approved = false
}
```

**POST /api/admin/services** - Tạo dịch vụ mới
- Header: `Authorization: Bearer <token>`
- Role: `admin`
- Body:
```json
{
  "name": "Sửa điện",
  "description": "Sửa chữa hệ thống điện trong nhà",
  "image_url": "http://...",
  "price_range": "100k-500k",
  "base_price": 100000
}
```

**PUT /api/admin/services/:id** - Cập nhật dịch vụ
- Header: `Authorization: Bearer <token>`
- Role: `admin`
- Body: (tương tự POST)

**DELETE /api/admin/services/:id** - Xóa dịch vụ (soft delete)
- Header: `Authorization: Bearer <token>`
- Role: `admin`

## Thử nghiệm với Postman

1. Đăng nhập lấy token
2. Thêm header `Authorization: Bearer <token>`
3. Test các endpoint

Để test Socket.io, có thể dùng:
- [Socket.io Client Tester](https://socket.io/)
- Hoặc write client-side test

## Troubleshooting

1. **Socket không kết nối**: Kiểm tra CORS origin config
2. **Events không nhận**: Đảm bảo client emit 'register' event
3. **Real-time không hoạt động**: Check console server và client logs
