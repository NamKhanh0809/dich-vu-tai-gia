<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
      <h1 class="text-2xl font-bold mb-6">Đăng ký làm thợ</h1>

      <form @submit.prevent="submitApplication" class="space-y-4">
        <!-- Error -->
        <div v-if="error" class="bg-red-50 text-red-800 p-3 rounded text-sm">
          {{ error }}
        </div>

        <!-- Success -->
        <div v-if="successMsg" class="bg-green-50 text-green-800 p-3 rounded text-sm">
          {{ successMsg }}
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="form.email" type="email" required class="input-field" placeholder="email@example.com" />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium mb-1">Số điện thoại</label>
          <input v-model="form.phone" type="tel" required class="input-field" placeholder="0901234567" />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium mb-1">Mật khẩu</label>
          <input v-model="form.password" type="password" required class="input-field" placeholder="••••••••" />
        </div>

        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium mb-1">Họ và tên</label>
          <input v-model="form.fullName" type="text" required class="input-field" placeholder="Nguyễn Văn A" />
        </div>

        <!-- CCCD Front -->
        <div>
          <label class="block text-sm font-medium mb-1">Ảnh CCCD mặt trước</label>
          <input
            type="file"
            accept="image/*"
            @change="e => form.cccd_front = e.target.files[0]"
            required
            class="input-field"
          />
          <p v-if="form.cccd_front" class="text-xs text-green-600 mt-1">✓ {{ form.cccd_front.name }}</p>
        </div>

        <!-- CCCD Back -->
        <div>
          <label class="block text-sm font-medium mb-1">Ảnh CCCD mặt sau</label>
          <input
            type="file"
            accept="image/*"
            @change="e => form.cccd_back = e.target.files[0]"
            required
            class="input-field"
          />
          <p v-if="form.cccd_back" class="text-xs text-green-600 mt-1">✓ {{ form.cccd_back.name }}</p>
        </div>

        <!-- Certificates -->
        <div>
          <label class="block text-sm font-medium mb-1">Bằng cấp / Chứng chỉ (có thể chọn nhiều)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            @change="handleCertificatesChange"
            class="input-field"
          />
          <p v-if="form.certificates.length" class="text-xs text-green-600 mt-1">
            ✓ Đã chọn {{ form.certificates.length }} ảnh
          </p>
        </div>

        <button type="submit" :disabled="submitting" class="btn-primary w-full py-2">
          {{ submitting ? 'Đang gửi...' : 'Gửi hồ sơ ứng tuyển' }}
        </button>
      </form>

      <!-- Info Box -->
      <div class="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 class="font-bold text-blue-900 mb-2">📝 Lưu ý:</h3>
        <ul class="text-xs text-blue-800 space-y-1">
          <li>✓ Hồ sơ sẽ được admin xem xét trong 1-2 ngày làm việc</li>
          <li>✓ Ảnh phải rõ ràng, không bị che khuất</li>
          <li>✓ Bạn sẽ nhận thông báo khi hồ sơ được duyệt</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import apiClient from '@/services/api'

const router = useRouter()
const notificationStore = useNotificationStore()

const form = reactive({
  email: '',
  phone: '',
  password: '',
  fullName: '',
  cccd_front: null,
  cccd_back: null,
  certificates: [],
})

const submitting = ref(false)
const error = ref('')
const successMsg = ref('')

function handleCertificatesChange(event) {
  form.certificates = Array.from(event.target.files)
}

async function submitApplication() {
  error.value = ''
  successMsg.value = ''

  if (!form.email || !form.phone || !form.password || !form.fullName) {
    error.value = 'Vui lòng điền đầy đủ thông tin.'
    return
  }

  if (!form.cccd_front || !form.cccd_back) {
    error.value = 'Vui lòng tải lên ảnh CCCD mặt trước và mặt sau.'
    return
  }

  if (form.certificates.length === 0) {
    error.value = 'Vui lòng tải lên ít nhất một ảnh bằng cấp/chứng chỉ.'
    return
  }

  submitting.value = true
  try {
    const payload = new FormData()
    payload.append('email', form.email)
    payload.append('phone', form.phone)
    payload.append('password', form.password)
    payload.append('fullName', form.fullName)
    payload.append('cccd_front', form.cccd_front)
    payload.append('cccd_back', form.cccd_back)

    form.certificates.forEach((file) => {
      payload.append('certificates', file)
    })

    const res = await apiClient.post('/auth/register-worker', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    successMsg.value = res.data.message || 'Hồ sơ đã được gửi thành công.'
    notificationStore.success('Hồ sơ ứng tuyển đã được gửi!')
    
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    const msg = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
    error.value = msg
    notificationStore.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
