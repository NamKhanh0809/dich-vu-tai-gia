-- Tạo cơ sở dữ liệu (nếu chưa có)
CREATE DATABASE IF NOT EXISTS home_service_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE home_service_db;

-- 1. Bảng Users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,      -- Mã hóa bcrypt hoặc similar
    role ENUM('customer', 'worker', 'admin') NOT NULL DEFAULT 'customer',
    is_locked BOOLEAN DEFAULT FALSE,           -- FALSE: active, TRUE: bị khóa
    admin_token VARCHAR(255) NULL,             -- Token bảo mật riêng cho admin (nếu cần)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bảng Profiles (1-1 với Users)
CREATE TABLE Profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    -- Thông tin chung
    address TEXT NULL,
    -- Dành cho thợ (worker)
    cccd_front_url VARCHAR(500) NULL,          -- Ảnh mặt trước CCCD
    cccd_back_url VARCHAR(500) NULL,           -- Ảnh mặt sau CCCD
    certificate_url VARCHAR(500) NULL,         -- Chứng chỉ nghề/bằng cấp
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejected_reason TEXT NULL,                 -- Lý do từ chối (nếu có)
    -- Thời gian
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_approval (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng Address Book (Sổ địa chỉ)
CREATE TABLE AddressBook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    label VARCHAR(50) NOT NULL,                -- Ví dụ: "Nhà riêng", "Công ty"
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    full_address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng Services (Dịch vụ)
CREATE TABLE Services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    price_range VARCHAR(100) NOT NULL,         -- Ví dụ: "200,000 - 500,000 VNĐ" (hiển thị)
    base_price DECIMAL(12,0) NULL,             -- Giá cơ bản (nếu cần tính toán)
    status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bảng Orders (Đơn đặt dịch vụ)
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,                  -- ID khách đặt
    service_id INT NOT NULL,
    worker_id INT NULL,                        -- Thợ được giao (nullable)
    scheduled_datetime DATETIME NOT NULL,      -- Giờ hẹn làm việc
    address TEXT NOT NULL,                     -- Địa chỉ thi công (có thể copy từ AddressBook)
    note TEXT NULL,                            -- Ghi chú thêm
    status ENUM(
        'pending_approval',    -- Chờ admin duyệt
        'approved',            -- Đã duyệt, chưa giao thợ
        'assigned',            -- Đã giao thợ
        'in_progress',         -- Đang thực hiện
        'completed',           -- Hoàn thành
        'cancelled',           -- Bị từ chối/hủy
        'refunded'             -- Hoàn tiền xong
    ) DEFAULT 'pending_approval',
    total_amount DECIMAL(12,0) NULL,           -- Tổng tiền (có thể tính sau)
    admin_note TEXT NULL,                      -- Ghi chú nội bộ của admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_worker (worker_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bảng Reviews (Đánh giá & Nhận xét)
CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,              -- Mỗi đơn chỉ một đánh giá
    customer_id INT NOT NULL,
    worker_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES Users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES Users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_worker (worker_id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Bảng Complaints (Khiếu nại & Hoàn tiền)
CREATE TABLE Complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    complainant_id INT NOT NULL,               -- Người khiếu nại (customer hoặc worker)
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    resolution TEXT NULL,                      -- Hướng giải quyết của admin
    status ENUM('pending', 'resolved', 'refunded') DEFAULT 'pending',
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (complainant_id) REFERENCES Users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Bảng Notifications (Thông báo)
CREATE TABLE Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_order_id INT NULL,                 -- Có thể null (liên quan đến đơn hàng nào)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (related_order_id) REFERENCES Orders(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_receiver (receiver_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Tùy chọn) Thêm ràng buộc check cho Profiles: nếu role worker thì cccd, certificate bắt buộc có thể xử lý ở tầng ứng dụng