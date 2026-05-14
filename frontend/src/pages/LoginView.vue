<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Đăng nhập</h2>
        <p class="mt-2 text-sm text-gray-600">Nhập thông tin tài khoản của bạn</p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Email or Username -->
        <div>
          <label for="identifier" class="form-label">Email hoặc Tên đăng nhập</label>
          <input
            id="identifier"
            v-model="credentials.identifier"
            type="text"
            required
            class="input-field"
            placeholder="example@email.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="form-label">Mật khẩu</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="authStore.loading" class="w-full btn-primary">
          {{ authStore.loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <!-- Register Link -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Chưa có tài khoản?
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            Đăng ký ngay
          </router-link>
        </p>
      </div>

      <!-- Roles Info -->
      <div class="mt-8 space-y-4 text-sm">
        <div class="bg-blue-50 p-3 rounded-md">
          <p class="font-bold text-blue-900">👥 Khách hàng:</p>
          <p class="text-blue-700">Đặt dịch vụ, theo dõi đơn hàng</p>
        </div>
        <div class="bg-green-50 p-3 rounded-md">
          <p class="font-bold text-green-900">🔧 Thợ:</p>
          <p class="text-green-700">Nhận đơn, hoàn thành công việc</p>
        </div>
        <div class="bg-purple-50 p-3 rounded-md">
          <p class="font-bold text-purple-900">⚙️ Admin:</p>
          <p class="text-purple-700">Quản lý hệ thống, duyệt đơn</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const error = ref(authStore.error)
const credentials = ref({
  identifier: '',
  password: '',
})

const handleLogin = async () => {
  try {
    error.value = null
    await authStore.login(credentials.value)
  } catch (err) {
    error.value = authStore.error
  }
}
</script>
