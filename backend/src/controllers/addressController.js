const { 
    getAddressesByUser, 
    createAddress, 
    // Giả sử bạn sẽ thêm các hàm này vào model addressModel
    updateAddressById, 
    deleteAddressById, 
    setAddressDefault 
} = require('../models/addressModel');

const getAddresses = async (req, res) => {
    try {
        const addresses = await getAddressesByUser(req.user.id);
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Đổi tên từ addAddress thành createAddress cho đồng bộ với Frontend
const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = require('../config/database');

        // 1. Nhận dữ liệu từ Frontend (Lưu ý: Frontend đang gửi là 'phone' chứ không phải 'recipient_phone')
        const label = req.body.label || 'Địa chỉ';
        const full_address = req.body.full_address;
        const is_default = req.body.is_default ? 1 : 0;
        
        let finalName = req.body.recipient_name;
        let finalPhone = req.body.phone || req.body.recipient_phone; // Bắt cả 2 trường hợp tên biến

        // Nếu thiếu địa chỉ chi tiết thì chặn luôn
        if (!full_address) {
            return res.status(400).json({ message: 'Địa chỉ chi tiết không được để trống' });
        }

        // 2. GIẢI QUYẾT YÊU CẦU: Lấy tên và SĐT mặc định của User nếu để trống
        if (!finalName || !finalPhone) {
            // Truy vấn lấy số điện thoại từ bảng users và tên từ bảng profiles
            const [userInfo] = await pool.execute(
                `SELECT u.phone, p.full_name 
                 FROM users u 
                 LEFT JOIN profiles p ON u.id = p.user_id 
                 WHERE u.id = ?`, 
                [userId]
            );
            
            if (userInfo.length > 0) {
                // Nếu Frontend không gửi lên, tự động lấy dữ liệu từ DB đắp vào
                if (!finalName) finalName = userInfo[0].full_name || 'Người nhận';
                if (!finalPhone) finalPhone = userInfo[0].phone || '';
            } else {
                if (!finalName) finalName = 'Người nhận';
                if (!finalPhone) finalPhone = '';
            }
        }

        // 3. Xử lý logic địa chỉ mặc định
        if (is_default === 1) {
            await pool.execute('UPDATE addressbook SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        // 4. Lưu vào Database với các thông tin đã được đắp đầy đủ
        const [result] = await pool.execute(
            'INSERT INTO addressbook (user_id, label, recipient_name, recipient_phone, full_address, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, label, finalName, finalPhone, full_address, is_default]
        );

        res.status(201).json({ id: result.insertId, message: 'Thêm địa chỉ thành công' });
    } catch (error) {
        console.error("Lỗi chi tiết khi thêm địa chỉ:", error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
const pool = require('../config/database');

// --- Hàm Sửa địa chỉ ---
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Lấy dữ liệu từ body và xử lý giá trị mặc định để tránh lỗi 'NOT NULL'
        const label = req.body.label || 'Địa chỉ';
        const full_address = req.body.full_address || '';
        const recipient_phone = req.body.recipient_phone || '';
        const is_default = req.body.is_default ? 1 : 0;

        // 2. GIẢI PHÁP CHO LỖI recipient_name: 
        // Nếu Frontend không gửi recipient_name, ta lấy fullName từ req.user (nếu có) hoặc để mặc định.
        const recipient_name = req.body.recipient_name || req.user.fullName || 'Người nhận';

        // Kiểm tra nếu địa chỉ chi tiết trống thì báo lỗi luôn trước khi gửi tới DB
        if (!full_address) {
            return res.status(400).json({ message: 'Địa chỉ chi tiết không được để trống' });
        }

        if (is_default === 1) {
            await pool.execute('UPDATE addressbook SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        // 3. Thực hiện câu lệnh SQL với các biến đã được "làm sạch"
        const [result] = await pool.execute(
            'UPDATE addressbook SET label=?, recipient_name=?, recipient_phone=?, full_address=?, is_default=? WHERE id=? AND user_id=?',
            [
                label, 
                recipient_name,     // Đảm bảo không bao giờ là null
                recipient_phone,    // Đảm bảo không bao giờ là null
                full_address,       // Đảm bảo không bao giờ là null
                is_default, 
                id, 
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        res.json({ message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error("Lỗi SQL chi tiết:", error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- Hàm Xóa địa chỉ ---
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [result] = await pool.execute(
            'DELETE FROM addressbook WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ để xóa' });
        }

        res.json({ message: 'Xóa địa chỉ thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Nhớ thêm vào module.exports ở cuối file addressController.js

// Bạn nên bổ sung các hàm này để Frontend gọi không bị lỗi 404 hoặc 500
// (Cần viết thêm logic tương ứng trong models/addressModel.js)

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
