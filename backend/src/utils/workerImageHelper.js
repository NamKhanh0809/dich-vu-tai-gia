const fs = require('fs')
const path = require('path')

const baseImgDir = path.join(__dirname, '../../img')

// Tạo thư mục img/worker_<id>
const createWorkerDirectories = async (userId) => {
  const workerDir = path.join(baseImgDir, `worker_${userId}`)
  if (!fs.existsSync(workerDir)) {
    fs.mkdirSync(workerDir, { recursive: true })
  }
  // Tạo sub folders cho từng loại ảnh
  const subDirs = ['cccd', 'certificates']
  subDirs.forEach((sub) => {
    const subDir = path.join(workerDir, sub)
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true })
  })
  return workerDir
}

// Chuyển file từ temp sang thư mục worker, trả về object chứa đường dẫn tương đối
const moveWorkerImages = async (files, targetDir, userId) => {
  const result = {
    cccd_front: null,
    cccd_back: null,
    certificates: [],
  }

  // Hàm di chuyển một file
  const moveFile = (file, subFolder) => {
    const destDir = path.join(targetDir, subFolder)
    const destPath = path.join(destDir, file.filename)
    fs.renameSync(file.path, destPath)
    // Trả về đường dẫn tương đối để lưu DB
    return `img/worker_${userId}/${subFolder}/${file.filename}`
  }

  if (files.cccd_front && files.cccd_front[0]) {
    result.cccd_front = moveFile(files.cccd_front[0], 'cccd')
  }
  if (files.cccd_back && files.cccd_back[0]) {
    result.cccd_back = moveFile(files.cccd_back[0], 'cccd')
  }
  if (files.certificates && Array.isArray(files.certificates)) {
    files.certificates.forEach((file) => {
      const moved = moveFile(file, 'certificates')
      result.certificates.push(moved)
    })
  }

  return result
}

module.exports = { createWorkerDirectories, moveWorkerImages }
