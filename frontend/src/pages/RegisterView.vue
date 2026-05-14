<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h2>
        <p class="mt-2 text-sm text-gray-600">Tạo tài khoản khách hàng mới</p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Full Name -->
        <div>
          <label for="fullName" class="form-label">Họ và tên</label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            required
            class="input-field"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="input-field"
            placeholder="example@email.com"
          />
        </div>

        <!-- Phone -->
        <div>
          <label for="phone" class="form-label">Số điện thoại</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            required
            class="input-field"
            placeholder="0901234567"
          />
        </div>

        <!-- Address -->
        <div>
          <label for="address" class="form-label">Địa chỉ</label>
          <textarea
            id="address"
            v-model="formData.address"
            class="input-field"
            placeholder="Số nhà, đường, phường, quận..."
            rows="2"
          ></textarea>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="form-label">Mật khẩu</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <!-- Terms -->
        <div class="flex items-center">
          <input
            id="terms"
            v-model="formData.agreeTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600"
          />
          <label for="terms" class="ml-2 text-sm text-gray-600">
            Tôi đồng ý với
            <a href="#" class="text-blue-600 hover:text-blue-500">Điều khoản sử dụng</a>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="authStore.loading" class="w-full btn-primary">
          {{ authStore.loading ? 'Đang đăng ký...' : 'Đăng ký' }}
        </button>
      </form>

      <!-- Login Link -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Đã có tài khoản?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const error = ref(authStore.error)
const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

const handleRegister = async () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Mật khẩu không trùng khớp'
    return
  }

  try {
    error.value = null
    await authStore.register(formData.value)
  } catch (err) {
    error.value = authStore.error
  }
}
</script>
