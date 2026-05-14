# Admin Advanced Features - Reports, Complaints & Order Approval

## 📋 Tổng Quan

Backend đã được mở rộng với 3 nhóm chức năng quản trị chính:
1. **Báo cáo & Thống kê** - Xem chi tiết & phân tích đơn hàng
2. **Quản lý khiếu nại** - Xử lý khiếu nại từ khách hàng
3. **Phê duyệt đơn hàng** - Kiểm duyệt & gán thợ cho đơn

---

## 🗂️ File thay đổi

### Models (2 files)
- ✅ `src/models/orderModel.js` - Thêm 5 hàm mới cho admin
- ✅ `src/models/complaintModel.js` - **MỚI** 3 hàm quản lý khiếu nại

### Controllers (1 file)
- ✅ `src/controllers/adminController.js` - Thêm 7 handler mới

### Routes (1 file)
- ✅ `src/routes/adminRoutes.js` - Thêm 9 endpoint mới

---

## 📊 Báo cáo & Thống Kê

### 1. Thống kê số lượng đơn theo trạng thái

**GET** `/api/admin/reports/orders/summary`

**Query Parameters:**
```
startDate  (optional): YYYY-MM-DD, ví dụ "2026-04-01"
endDate    (optional): YYYY-MM-DD, ví dụ "2026-04-30"
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** (JSON)
```json
[
  {
    "status": "pending_approval",
    "count": 2
  },
  {
    "status": "assigned",
    "count": 5
  },
  {
    "status": "in_progress",
    "count": 3
  },
  {
    "status": "completed",
    "count": 15
  },
  {
    "status": "cancelled",
    "count": 1
  },
  {
    "status": "refunded",
    "count": 0
  }
]
```

**Ví dụ Postman:**
```
GET http://localhost:5000/api/admin/reports/orders/summary?startDate=2026-04-01&endDate=2026-04-30
```

---

### 2. Chi tiết danh sách đơn hàng với bộ lọc

**GET** `/api/admin/reports/orders/list`

**Query Parameters:**
```
startDate  (optional): YYYY-MM-DD
endDate    (optional): YYYY-MM-DD
worker_id  (optional): số ID của thợ
status     (optional): pending_approval, assigned, in_progress, completed, cancelled, refunded
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** (JSON Array)
```json
[
  {
    "id": 5,
    "customer_id": 2,
    "customer_email": "customer@email.com",
    "customer_phone": "0123456789",
    "customer_name": "Nguyễn Văn A",
    "service_id": 1,
    "service_name": "Sửa điện",
    "worker_id": 3,
    "worker_email": "worker@email.com",
    "worker_phone": "0987654321",
    "worker_name": "Nguyễn Văn B",
    "scheduled_datetime": "2026-04-25T10:00:00Z",
    "address": "123 Đường Lý Thường Kiệt, TP.HCM",
    "status": "completed",
    "note": "Vui lòng tới sáng",
    "admin_note": null,
    "created_at": "2026-04-20T14:30:00Z",
    "updated_at": "2026-04-25T15:00:00Z"
  }
]
```

**Ví dụ Postman:**
```
# Xem tất cả đơn của thợ id=3
GET http://localhost:5000/api/admin/reports/orders/list?worker_id=3

# Xem tất cả đơn đã hoàn thành
GET http://localhost:5000/api/admin/reports/orders/list?status=completed

# Xem đơn trong tháng 4 năm 2026
GET http://localhost:5000/api/admin/reports/orders/list?startDate=2026-04-01&endDate=2026-04-30
```

---

## 💬 Quản Lý Khiếu Nại

### Bảng Complaints (Database)
```sql
CREATE TABLE Complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    complainant_id INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'resolved', 'refunded') DEFAULT 'pending',
    resolution TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (complainant_id) REFERENCES Users(id)
);
```

### 1. Lấy danh sách khiếu nại

**GET** `/api/admin/complaints`

**Query Parameters:**
```
status  (optional): pending, resolved, refunded
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** (JSON Array)
```json
[
  {
    "id": 1,
    "order_id": 5,
    "order_status": "completed",
    "complainant_id": 2,
    "complainant_email": "customer@email.com",
    "complainant_phone": "0123456789",
    "complainant_name": "Nguyễn Văn A",
    "reason": "Thợ đến muộn 2 giờ",
    "status": "pending",
    "resolution": null,
    "resolved_at": null,
    "created_at": "2026-04-26T10:15:00Z"
  }
]
```

**Ví dụ Postman:**
```
# Xem tất cả khiếu nại chưa xử lý
GET http://localhost:5000/api/admin/complaints?status=pending

# Xem tất cả khiếu nại đã hoàn tiền
GET http://localhost:5000/api/admin/complaints?status=refunded
```

---

### 2. Giải quyết khiếu nại

**PATCH** `/api/admin/complaints/:id/resolve`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resolution": "Đã hoàn tiền 50% lệ phí dịch vụ",
  "action": "refund"  // hoặc "resolve"
}
```

**Response:**
```json
{
  "message": "Complaint refunded successfully"
}
```

**Behavior:**
- `action: "resolve"` → Complaint status = 'resolved', không thay đổi Order
- `action: "refund"` → Complaint status = 'refunded', Order status = 'refunded'
  - Gửi thông báo cho khách hàng, thợ, và người khiếu nại

**Ví dụ Postman:**
```
PATCH http://localhost:5000/api/admin/complaints/1/resolve
Content-Type: application/json

{
  "resolution": "Đã liên hệ thợ và khách, đồng ý hoàn lại 50%",
  "action": "refund"
}
```

---

## ✅ Phê Duyệt Đơn Hàng

### 1. Lấy danh sách đơn chờ phê duyệt

**GET** `/api/admin/orders/pending`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** (JSON Array)
```json
[
  {
    "id": 5,
    "customer_id": 2,
    "customer_email": "customer@email.com",
    "customer_phone": "0123456789",
    "customer_name": "Nguyễn Văn A",
    "service_id": 1,
    "service_name": "Sửa điện",
    "scheduled_datetime": "2026-04-25T10:00:00Z",
    "address": "123 Đường Lý Thường Kiệt, TP.HCM",
    "status": "pending_approval",
    "note": "Vui lòng tới sáng",
    "created_at": "2026-04-20T14:30:00Z"
  }
]
```

---

### 2. Phê duyệt đơn hàng (gán thợ)

**PATCH** `/api/admin/orders/:id/approve`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "worker_id": 3,
  "admin_note": "Giao cho thợ giỏi nhất"
}
```

**Response:**
```json
{
  "message": "Order approved and worker assigned"
}
```

**Behavior:**
- Order status: `pending_approval` → `assigned`
- Order worker_id: set thành worker_id được truyền
- Kiểm tra worker phải có `role='worker'` và `profile.approval_status='approved'`
- Real-time Socket events:
  - `new_order_assigned` → thợ (worker_id)
  - `order_approved` → khách (customer_id)
- Thông báo được gửi cho cả khách và thợ

**Ví dụ Postman:**
```
PATCH http://localhost:5000/api/admin/orders/5/approve
Content-Type: application/json

{
  "worker_id": 3,
  "admin_note": "Giao cho thợ Nguyễn Văn B - rất giỏi"
}
```

---

### 3. Từ chối đơn hàng

**PATCH** `/api/admin/orders/:id/reject`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "admin_note": "Không có thợ phù hợp, hẹn lại tuần sau"
}
```

**Response:**
```json
{
  "message": "Order cancelled"
}
```

**Behavior:**
- Order status: `pending_approval` → `cancelled`
- admin_note được lưu vào database
- Real-time Socket event: `order_rejected` → khách
- Thông báo gửi cho khách hàng kèm lý do từ chối

**Ví dụ Postman:**
```
PATCH http://localhost:5000/api/admin/orders/5/reject
Content-Type: application/json

{
  "admin_note": "Khách yêu cầu đặt lại vào tuần tiếp theo"
}
```

---

## 🧪 Test Cases Toàn Bộ

### Scenario 1: Xem báo cáo

```bash
# 1. Get summary
curl -X GET "http://localhost:5000/api/admin/reports/orders/summary?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer <token>"

# Response: [{status: "pending_approval", count: 2}, ...]
```

### Scenario 2: Quản lý khiếu nại

```bash
# 1. Get complaints
curl -X GET "http://localhost:5000/api/admin/complaints?status=pending" \
  -H "Authorization: Bearer <token>"

# 2. Resolve complaint
curl -X PATCH "http://localhost:5000/api/admin/complaints/1/resolve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"resolution":"Đã hoàn 50%","action":"refund"}'

# Response: {message: "Complaint refunded successfully"}
```

### Scenario 3: Phê duyệt đơn hàng

```bash
# 1. Get pending orders
curl -X GET "http://localhost:5000/api/admin/orders/pending" \
  -H "Authorization: Bearer <token>"

# 2. Approve order
curl -X PATCH "http://localhost:5000/api/admin/orders/5/approve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"worker_id":3,"admin_note":"Giao cho thợ giỏi"}'

# Response: {message: "Order approved and worker assigned"}

# 3. Reject order
curl -X PATCH "http://localhost:5000/api/admin/orders/6/reject" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"admin_note":"Không có thợ phù hợp"}'

# Response: {message: "Order cancelled"}
```

---

## 📋 API Summary - Admin Advanced Routes

| Method | Endpoint | Mô Tả | Params/Body |
|--------|----------|-------|------------|
| GET | `/api/admin/reports/orders/summary` | Thống kê | startDate, endDate |
| GET | `/api/admin/reports/orders/list` | Chi tiết danh sách | startDate, endDate, worker_id, status |
| GET | `/api/admin/complaints` | Danh sách khiếu nại | status (pending, resolved, refunded) |
| PATCH | `/api/admin/complaints/:id/resolve` | Giải quyết khiếu nại | resolution, action (resolve/refund) |
| GET | `/api/admin/orders/pending` | Đơn chờ duyệt | - |
| PATCH | `/api/admin/orders/:id/approve` | Phê duyệt đơn | worker_id, admin_note |
| PATCH | `/api/admin/orders/:id/reject` | Từ chối đơn | admin_note |

---

## 🔌 Real-Time Socket Events

### Events từ Server tới Client

#### `new_order_assigned`
Gửi tới: **Worker** (`user_${worker_id}`)
```javascript
{
  orderId: 5
}
```

#### `order_approved`
Gửi tới: **Customer** (`user_${customer_id}`)
```javascript
{
  orderId: 5
}
```

#### `order_rejected`
Gửi tới: **Customer** (`user_${customer_id}`)
```javascript
{
  orderId: 5,
  reason: "Không có thợ phù hợp"
}
```

---

## 📊 Database Schema

### Orders table (thêm cột)
```sql
ALTER TABLE Orders ADD COLUMN admin_note TEXT;
```

### Complaints table (tạo mới)
```sql
CREATE TABLE Complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    complainant_id INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'resolved', 'refunded') DEFAULT 'pending',
    resolution TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (complainant_id) REFERENCES Users(id)
);
```

---

## ✨ Highlights

1. **Báo cáo chi tiết** - Lọc theo nhiều tiêu chí
2. **Xử lý khiếu nại** - Hoàn tiền hoặc chỉ đánh dấu đã giải quyết
3. **Phê duyệt đơn tự động** - Kiểm tra worker đã được phê duyệt trước khi gán
4. **Real-time notifications** - Worker & customer nhận thông báo tức thì
5. **Audit trail** - Lưu lại admin_note cho mỗi hành động

---

## 🚀 Tiếp Theo

- [ ] Thêm bảng `Complaints` vào database
- [ ] Test tất cả endpoints với Postman
- [ ] Cập nhật Orders table thêm cột `admin_note`
- [ ] Implement frontend cho admin dashboard
- [ ] Thêm pagination cho danh sách lớn
- [ ] Export báo cáo CSV/PDF
