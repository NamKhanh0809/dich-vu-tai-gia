<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="card bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Đăng ký làm thợ</h2>

        <div v-if="statusMessage && !loading" class="rounded-md bg-green-50 p-4 mb-6">
          <p class="text-sm text-green-800">{{ statusMessage }}</p>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4 mb-6">
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="submitProfile" enctype="multipart/form-data" class="space-y-6">
          <div>
            <label for="fullName" class="form-label font-semibold">Họ và tên</label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              class="input-field border p-2 w-full rounded mt-1"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label for="email" class="form-label font-semibold">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field border p-2 w-full rounded mt-1"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <label for="phone" class="form-label font-semibold">Số điện thoại</label>
            <input
              id="phone"
              v-model="phone"
              type="tel"
              required
              class="input-field border p-2 w-full rounded mt-1"
              placeholder="0901234567"
            />
          </div>

          <div>
            <label for="password" class="form-label font-semibold">Mật khẩu đăng nhập</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input-field border p-2 w-full rounded mt-1"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div>
            <label for="cccdFront" class="form-label font-semibold">📷 Ảnh CMND/CCCD (mặt trước)</label>
            <input
              id="cccdFront"
              type="file"
              accept="image/*"
              required
              class="input-field border p-2 w-full rounded mt-1"
              @change="onFileChange('cccd_front', $event)"
            />
            <p v-if="files.cccd_front" class="mt-2 text-sm text-green-600">✓ Đã chọn file</p>
          </div>

          <div>
            <label for="cccdBack" class="form-label font-semibold">📷 Ảnh CMND/CCCD (mặt sau)</label>
            <input
              id="cccdBack"
              type="file"
              accept="image/*"
              required
              class="input-field border p-2 w-full rounded mt-1"
              @change="onFileChange('cccd_back', $event)"
            />
            <p v-if="files.cccd_back" class="mt-2 text-sm text-green-600">✓ Đã chọn file</p>
          </div>

          <div>
            <label for="certificate" class="form-label font-semibold">📄 Chứng chỉ/Bằng cấp (Nếu có)</label>
            <input
              id="certificate"
              type="file"
              accept="image/*,application/pdf"
              class="input-field border p-2 w-full rounded mt-1"
              @change="onFileChange('certificate', $event)"
            />
            <p v-if="files.certificate" class="mt-2 text-sm text-green-600">✓ Đã chọn file</p>
          </div>

          <button type="submit" :disabled="loading" class="w-full btn-primary bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
            {{ loading ? 'Đang xử lý...' : 'Gửi hồ sơ' }}
          </button>
        </form>

        <div class="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 class="font-bold text-blue-900 mb-2">📝 Lưu ý:</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>✓ Hồ sơ sẽ được admin xem xét trong 1-2 ngày làm việc</li>
            <li>✓ Ảnh phải rõ ràng, không bị che khuất</li>
            <li>✓ Bạn sẽ nhận thông báo khi hồ sơ được duyệt</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/services/api'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

// 1. ĐÃ SỬA: Khai báo ĐẦY ĐỦ các biến thiếu
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('') 

// 2. ĐÃ SỬA: Đổi tên key thành cccd_front và cccd_back cho khớp Backend
const files = ref({
  cccd_front: null,
  cccd_back: null,
  certificate: null,
})

const loading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const onFileChange = (key, event) => {
  files.value[key] = event.target.files[0]
}

const submitProfile = async () => {
  // Validate dữ liệu
  if (!fullName.value || !email.value || !phone.value || !password.value || !files.value.cccd_front || !files.value.cccd_back) {
    errorMessage.value = 'Vui lòng điền đầy đủ thông tin bắt buộc và tải lên ảnh CCCD'
    return
  }

  loading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('fullName', fullName.value)
    formData.append('email', email.value)
    formData.append('phone', phone.value)
    formData.append('password', password.value) // Gửi thêm mật khẩu
    
    // Tên trường (field name) phải khớp 100% với req.files.cccd_front ở Node.js
    formData.append('cccd_front', files.value.cccd_front)
    formData.append('cccd_back', files.value.cccd_back)
    
    if (files.value.certificate) {
        formData.append('certificate', files.value.certificate)
    }

    // GỌI API: Nhớ kiểm tra xem đường dẫn đăng ký thợ của bạn là '/auth/register-worker' hay '/profiles/worker' nhé!
    await apiClient.post('/auth/register-worker', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    statusMessage.value = 'Hồ sơ đã được gửi thành công! Vui lòng chờ admin xem xét.'
    notificationStore.success('Hồ sơ được gửi thành công!')

    // Reset form
    fullName.value = ''
    email.value = ''
    phone.value = ''
    password.value = ''
    files.value = { cccd_front: null, cccd_back: null, certificate: null }

    // ĐÃ SỬA LỖI VĂNG TRANG: Đợi 2.5 giây cho khách đọc dòng thông báo rồi mới đẩy về trang Login
    setTimeout(() => {
        router.push('/login')
    }, 2500)

  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Lỗi khi gửi hồ sơ. Email hoặc SĐT có thể đã tồn tại.'
    notificationStore.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}
</script>