<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
      <router-link to="/" class="text-2xl font-bold text-blue-600">HomeService</router-link>
      
      <!-- Menu điều hướng chính -->
      <div class="hidden md:flex space-x-6">
        <router-link to="/" class="hover:text-blue-500">Trang chủ</router-link>
        <router-link to="/price" class="hover:text-blue-500">Bảng giá dịch vụ</router-link>
        <router-link to="/booking" class="hover:text-blue-500">Đăng ký dịch vụ</router-link>
        <router-link to="/apply" class="hover:text-blue-500">Ứng tuyển thợ</router-link>
        <router-link to="/complaint" class="hover:text-blue-500">Báo cáo sự cố</router-link>
      </div>

      <!-- Khối đăng nhập / thông tin user -->
      <div class="flex items-center space-x-4">
        <template v-if="authStore.isAuthenticated">
          <span class="text-gray-600">{{ authStore.user?.email }}</span>
          <button @click="logout" class="text-red-500 hover:text-red-700">Đăng xuất</button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-blue-600 hover:text-blue-800">Đăng nhập</router-link>
          <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Đăng ký</router-link>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>