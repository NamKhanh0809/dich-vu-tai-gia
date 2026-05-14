const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserByPhone, findUserById } = require('../models/userModel');
// SỬA Ở ĐÂY: Thêm getProfileByUserId vào danh sách import
const { createEmptyProfile, updateProfileImages, getProfileByUserId } = require('../models/profileModel');
const { createWorkerDirectories, moveWorkerImages } = require('../utils/workerImageHelper');
const fs = require('fs');
const path = require('path');

const register = async (req, res) => {
    const { email, phone, password, fullName, address, role = 'customer' } = req.body;
    try {
        // Kiểm tra thêm cả fullName để đảm bảo khách không để trống tên
        if (!email || !phone || !password || !fullName) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) return res.status(400).json({ message: 'Email đã tồn tại' });
        
        const existingPhone = await findUserByPhone(phone);
        if (existingPhone) return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 1. Tạo User trong bảng users
        const userId = await createUser(email, phone, hashedPassword, role, fullName);
        
        // 2. 🚨 SỬA Ở ĐÂY: Lưu trực tiếp fullName vào bảng profiles thay vì dùng createEmptyProfile 🚨
        const pool = require('../config/database');
        await pool.execute(
            'INSERT INTO profiles (user_id, full_name, approval_status) VALUES (?, ?, "approved")',
            [userId, fullName] // Khách hàng thì mặc định status là approved luôn
        );
        
        // 3. Lưu địa chỉ (Đã xử lý try/catch an toàn từ trước)
        if (address && address.trim() !== '') {
            try {
                // Đã chèn sẵn require pool ở trên rồi nên không cần gọi lại
                await pool.execute(
                    'INSERT INTO addressbook (user_id, label, recipient_name, recipient_phone, full_address, is_default) VALUES (?, ?, ?, ?, ?, 1)',
                    [
                        userId, 
                        'Nhà riêng',
                        fullName,       // Dùng luôn fullName làm tên người nhận
                        phone,          // Dùng luôn phone làm số ĐT người nhận
                        address.trim()
                    ]
                );
            } catch (addressError) {
                console.error('❌ LỖI KHI LƯU VÀO SỔ ĐỊA CHỈ:', addressError.message);
            }
        }
        
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error('Lỗi tổng thể Register:', err.message);
        res.status(500).json({ message: 'Server error', detail: err.message });
    }
};

const login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/phone and password required' });
        }

        let user = await findUserByEmail(identifier);
        if (!user) user = await findUserByPhone(identifier);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (user.is_locked) return res.status(403).json({ message: 'Account is locked' });
        
        // Kiểm tra password - trim whitespace
        const trimmedPassword = String(password).trim();
        const trimmedHash = String(user.password_hash).trim();
        
        const isMatch = await bcrypt.compare(trimmedPassword, trimmedHash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // === THÊM MỚI TỪ ĐÂY: CHẶN THỢ BỊ TỪ CHỐI HOẶC CHỜ DUYỆT ĐĂNG NHẬP ===
        if (user.role === 'worker') {
            const profile = await getProfileByUserId(user.id);
            
            if (profile) {
                if (profile.approval_status === 'rejected') {
                    return res.status(403).json({ 
                        message: 'Hồ sơ ứng tuyển của bạn đã bị từ chối. Không thể đăng nhập.' 
                    });
                }
                
                if (profile.approval_status === 'pending') {
                    return res.status(403).json({ 
                        message: 'Hồ sơ của bạn đang chờ Admin phê duyệt. Vui lòng quay lại sau.' 
                    });
                }
            }
        }
        // === KẾT THÚC THÊM MỚI ===
        
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ 
            token, 
            access_token: token,
            user: { 
                id: user.id, 
                email: user.email, 
                phone: user.phone, 
                role: user.role,
                fullName: user.full_name 
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// === REGISTER WORKER ===
// === REGISTER WORKER ===
const registerWorker = async (req, res) => {
  try {
    const { email, phone, password, fullName } = req.body;

    if (!email || !phone || !password || !fullName) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    if (!req.files?.cccd_front || !req.files?.cccd_back) {
      return res.status(400).json({ message: 'Vui lòng tải lên ảnh CCCD mặt trước và mặt sau.' });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) return res.status(400).json({ message: 'Email đã tồn tại' });
    const existingPhone = await findUserByPhone(phone);
    if (existingPhone) return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });

    // 1. Tạo User và Profile rỗng
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(email, phone, hashedPassword, 'worker', fullName);
    await createEmptyProfile(userId);

    // 2. Tạo khu vực lưu ảnh (Khu cách ly pending)
    const pendingDir = path.join(__dirname, `../../img/pending/worker_${userId}`);
    if (!fs.existsSync(pendingDir)) {
        fs.mkdirSync(pendingDir, { recursive: true });
    }

    let frontPath = null;
    let backPath = null;
    let certPath = null;

    // Hàm lưu file và trả về đường dẫn
    const saveFile = (fileObj) => {
        const uniqueName = Date.now() + '-' + fileObj.originalname; 
        const finalPath = path.join(pendingDir, uniqueName);
        fs.writeFileSync(finalPath, fileObj.buffer);
        return `/img/pending/worker_${userId}/${uniqueName}`;
    };

    // 3. Đọc và lưu từng file riêng biệt
    if (req.files.cccd_front && req.files.cccd_front[0]) {
        frontPath = saveFile(req.files.cccd_front[0]);
    }
    if (req.files.cccd_back && req.files.cccd_back[0]) {
        backPath = saveFile(req.files.cccd_back[0]);
    }
    if (req.files.certificate && req.files.certificate[0]) {
        certPath = saveFile(req.files.certificate[0]);
    }

    // 4. 🚨 CHÌA KHÓA: Cập nhật trực tiếp vào 3 cột riêng biệt trong bảng profiles 🚨
    const pool = require('../config/database');
    await pool.execute(
        `UPDATE profiles 
         SET full_name = ?, 
             cccd_front_url = ?, 
             cccd_back_url = ?, 
             certificate_url = ?, 
             approval_status = 'pending' 
         WHERE user_id = ?`,
        [fullName, frontPath, backPath, certPath, userId]
    );

    res.status(201).json({
      message: 'Hồ sơ ứng tuyển đã được gửi thành công. Vui lòng chờ admin phê duyệt.',
      userId
    });
  } catch (err) {
    console.error('Error in registerWorker:', err);
    res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.', detail: err.message });
  }
};

module.exports = { register, login, registerWorker };