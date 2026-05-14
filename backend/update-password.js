const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const updateAllPasswords = async () => {
  let connection;
  try {
    // 1. Kết nối tới Database
    console.log('⏳ Đang kết nối tới Database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',        // Thường XAMPP user là root
      password: process.env.DB_PASSWORD || '',    // Thường XAMPP pass để trống
      database: process.env.DB_NAME || 'home_service_db'
    });
    console.log('✅ Kết nối Database thành công!');

    // 2. Tạo mã băm cho mật khẩu mới
    const plainPassword = '123456';
    console.log(`⏳ Đang tạo mã băm (hash) cho mật khẩu "${plainPassword}"...`);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Cập nhật mã băm mới cho TOÀN BỘ dòng trong bảng users
    // Chú ý: Lệnh UPDATE không có WHERE sẽ áp dụng cho tất cả dữ liệu
    console.log('⏳ Đang cập nhật Database...');
    const [result] = await connection.execute(
      "UPDATE users SET password_hash = ?",
      [hashedPassword]
    );

    // 4. Thông báo kết quả
    console.log(`🎉 THÀNH CÔNG! Đã đổi mật khẩu về 123456 cho ${result.affectedRows} tài khoản.`);

  } catch (err) {
    console.error('❌ CÓ LỖI XẢY RA:', err.message);
  } finally {
    // 5. Đóng kết nối để giải phóng bộ nhớ
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối Database.');
      process.exit(0); // Kết thúc script hoàn toàn
    }
  }
};

// Khởi chạy script
updateAllPasswords();