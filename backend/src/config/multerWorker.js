const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Lưu tạm vào thư mục temp, sau khi có userId sẽ chuyển sang img/worker_<id>
const tempDir = path.join(__dirname, '../../uploads/temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    // Đặt tên file duy nhất để tránh ghi đè
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB mỗi ảnh
}).fields([
  { name: 'cccd_front', maxCount: 1 },
  { name: 'cccd_back', maxCount: 1 },
  { name: 'certificates', maxCount: 10 }, // tối đa 10 ảnh bằng cấp
])

module.exports = upload
