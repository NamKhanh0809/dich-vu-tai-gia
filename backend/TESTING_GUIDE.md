# Backend Installation & Testing Guide

## 🚀 Installation

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm hoặc yarn

### Step 1: Clone Dependencies
```bash
cd backend
npm install
```

### Step 2: Database Setup
```bash
# Import schema
mysql -u root -p home_service_db < ../database/schema.sql

# Or create database manually and run queries
```

### Step 3: Environment Variables

File `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=home_service_db
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
NODE_ENV=development
```

### Step 4: Run Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## 📋 Testing dengan Postman

### 1. Tạo Collection

1. Mở Postman
2. Create New Collection "Home Service Platform"
3. Add Requests theo dưới

### 2. Authentication

#### Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "customer@email.com",
  "phone": "0123456789",
  "password": "password123",
  "role": "customer"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

#### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "identifier": "customer@email.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "customer@email.com",
    "phone": "0123456789",
    "role": "customer"
  }
}
```

**💡 Copy token để dùng cho các request sau**

### 3. Services (Public)

#### Get All Services
```
GET http://localhost:5000/api/services
```

#### Get Service by ID
```
GET http://localhost:5000/api/services/1
```

### 4. Customer - Orders

#### Create Order
```
POST http://localhost:5000/api/orders
Headers:
  Authorization: Bearer <token_customer>
  Content-Type: application/json

{
  "service_id": 1,
  "scheduled_datetime": "2024-12-25T10:00:00Z",
  "address": "123 Đường Lý Thường Kiệt, TP.HCM",
  "note": "Vui lòng tới vào sáng"
}
```

#### Get My Orders
```
GET http://localhost:5000/api/orders
Headers:
  Authorization: Bearer <token_customer>
```

### 5. Customer - Address Book

#### Get Address List
```
GET http://localhost:5000/api/address-book
Headers:
  Authorization: Bearer <token_customer>
```

#### Add Address
```
POST http://localhost:5000/api/address-book
Headers:
  Authorization: Bearer <token_customer>
  Content-Type: application/json

{
  "label": "Nhà",
  "recipient_name": "Nguyễn Văn A",
  "recipient_phone": "0123456789",
  "full_address": "123 Đường Lý Thường Kiệt, TP.HCM",
  "is_default": true
}
```

### 6. Worker - Profile

#### Register as Worker
```
POST http://localhost:5000/api/auth/register
{
  "email": "worker@email.com",
  "phone": "0987654321",
  "password": "password123",
  "role": "worker"
}
```

#### Upload Worker Documents
```
POST http://localhost:5000/api/profiles/worker
Headers:
  Authorization: Bearer <token_worker>
  Content-Type: multipart/form-data

Form data:
  - fullName: "Nguyễn Văn B"
  - cccdFront: [file]
  - cccdBack: [file]
  - certificate: [file]
```

#### Get Profile
```
GET http://localhost:5000/api/profiles
Headers:
  Authorization: Bearer <token_worker>
```

### 7. Worker - Orders & History

#### Get Assigned Orders
```
GET http://localhost:5000/api/worker/orders
Headers:
  Authorization: Bearer <token_worker>
```

#### Update Order Status
```
PATCH http://localhost:5000/api/worker/orders/1/status
Headers:
  Authorization: Bearer <token_worker>
  Content-Type: application/json

{
  "status": "in_progress"
}
```

Values: "in_progress" → "completed"

#### Get Work History & Earnings
```
GET http://localhost:5000/api/worker/history?page=1&limit=10
Headers:
  Authorization: Bearer <token_worker>
```

### 8. Customer - Reviews

#### Add Review
```
POST http://localhost:5000/api/reviews
Headers:
  Authorization: Bearer <token_customer>
  Content-Type: application/json

{
  "order_id": 1,
  "rating": 5,
  "comment": "Thợ rất tận tâm, sẽ gọi lại"
}
```

#### Get Worker Reviews
```
GET http://localhost:5000/api/reviews/worker/2
```

### 9. Admin - User Management

#### Register Admin (for testing)
```
POST http://localhost:5000/api/auth/register
{
  "email": "admin@email.com",
  "phone": "0999999999",
  "password": "adminpass123",
  "role": "admin"
}
```

#### Get All Users
```
GET http://localhost:5000/api/admin/users
Headers:
  Authorization: Bearer <token_admin>
```

With filter:
```
GET http://localhost:5000/api/admin/users?role=worker
```

#### Lock User Account
```
PATCH http://localhost:5000/api/admin/users/2/lock
Headers:
  Authorization: Bearer <token_admin>
  Content-Type: application/json

{
  "is_locked": true
}
```

### 10. Admin - Profile Approval

#### Get Pending Workers
```
GET http://localhost:5000/api/admin/workers/pending
Headers:
  Authorization: Bearer <token_admin>
```

#### Approve Worker
```
PATCH http://localhost:5000/api/admin/profiles/2/approve
Headers:
  Authorization: Bearer <token_admin>
  Content-Type: application/json

{
  "approved": true
}
```

#### Reject Worker
```
PATCH http://localhost:5000/api/admin/profiles/2/approve
Headers:
  Authorization: Bearer <token_admin>
  Content-Type: application/json

{
  "approved": false,
  "reject_reason": "Tài liệu CCCD không rõ ràng"
}
```

### 11. Admin - Service Management

#### Create Service
```
POST http://localhost:5000/api/admin/services
Headers:
  Authorization: Bearer <token_admin>
  Content-Type: application/json

{
  "name": "Sửa điện",
  "description": "Sửa chữa hệ thống điện trong nhà",
  "image_url": "http://example.com/image.jpg",
  "price_range": "100k-500k",
  "base_price": 100000
}
```

#### Update Service
```
PUT http://localhost:5000/api/admin/services/1
Headers:
  Authorization: Bearer <token_admin>
  Content-Type: application/json

{
  "name": "Sửa điện (Updated)",
  "description": "...",
  "image_url": "...",
  "price_range": "150k-600k",
  "base_price": 150000
}
```

#### Delete Service
```
DELETE http://localhost:5000/api/admin/services/1
Headers:
  Authorization: Bearer <token_admin>
```

## 🔌 Testing Socket.io

### Using Browser Console

```javascript
// Connect to server
const socket = io('http://localhost:5000');

// Register user
socket.on('connect', () => {
  socket.emit('register', 1); // userId
});

// Listen to events
socket.on('order_status_updated', (data) => {
  console.log('Order updated:', data);
});

socket.on('profile_approved', (data) => {
  console.log('Profile approved:', data);
});
```

### Using Node.js Test Script

Create `test-socket.js`:
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('register', 1);
});

socket.on('order_status_updated', (data) => {
  console.log('Received:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

setTimeout(() => {
  socket.disconnect();
}, 10000);
```

Run: `node test-socket.js`

## 🐛 Common Issues & Solutions

### Issue: "Port already in use"
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Issue: "Connect ECONNREFUSED 127.0.0.1:3306"
- Check MySQL is running
- Verify DB credentials in `.env`
- Create database: `CREATE DATABASE home_service_db`

### Issue: "File upload error"
- Create `uploads` folder: `mkdir uploads`
- Check folder permissions
- Check file size (max 5MB)

### Issue: "JWT invalid"
- Ensure token is copied correctly
- Check JWT_SECRET matches in `.env`
- Token may have expired (7 days default)

## ✅ Verification Checklist

- [ ] npm install hoàn thành
- [ ] MySQL database tạo thành công
- [ ] `.env` file cấu hình đúng
- [ ] `npm run dev` chạy không lỗi
- [ ] Server running on http://localhost:5000
- [ ] `/health` endpoint response "OK"
- [ ] Có thể register account
- [ ] Có thể login lấy JWT token
- [ ] Can call protected endpoints with token
- [ ] Socket.io connections work

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs (server & browser)
2. Check `.env` configuration
3. Check database connection
4. Check file permissions
5. Verify JWT token is valid
