<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            
            <router-link :to="isAdmin ? '/admin/dashboard' : '/'" class="text-2xl font-bold text-blue-600">
              HomeService
            </router-link>

           <div v-if="!isAdmin" class="hidden md:flex space-x-6">
  
  <template v-if="authStore.user?.role !== 'worker'">
    <router-link to="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Trang chủ</router-link>
    <router-link to="/price" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Bảng giá dịch vụ</router-link>
    <router-link to="/booking" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Đăng ký dịch vụ</router-link>
  </template>

  <template v-if="authStore.user?.role === 'worker'">
    <router-link to="/worker/incoming" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Đơn được giao</router-link>
    <router-link to="/worker/history" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Lịch sử làm việc</router-link>
  </template>

  <router-link to="/complaint" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Báo cáo sự cố</router-link>
  
  <router-link v-if="!authStore.isAuthenticated" to="/worker-register" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
    Ứng tuyển thợ
  </router-link>

</div>

          </div>

          <div class="flex items-center space-x-4">
            <template v-if="!authStore.isAuthenticated">
 
  <router-link to="/login" class="btn-primary">Đăng nhập</router-link>
  <router-link to="/register" class="btn-secondary">Đăng ký</router-link>
</template>

            <div v-else class="relative">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2">
                <span>{{ authStore.user?.email || 'User' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                <div class="px-4 py-2 text-sm text-gray-700">
                  Vai trò: <span class="font-bold">{{ authStore.user?.role }}</span>
                </div>
                <hr />
                <template v-if="authStore.user?.role === 'customer'">
                  <router-link to="/my-orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showUserMenu = false">
                    Đơn hàng của tôi
                  </router-link>
                  <router-link to="/address-book" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showUserMenu = false">
                    Sổ địa chỉ
                  </router-link>
                </template>
                <template v-if="authStore.user?.role === 'worker'">
                  <router-link to="/worker/incoming" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showUserMenu = false">
                    Đơn được giao
                  </router-link>
                  <router-link to="/worker/history" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showUserMenu = false">
                    Lịch sử làm việc
                  </router-link>
                </template>
                <template v-if="authStore.user?.role === 'admin'">
                  <router-link to="/admin/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showUserMenu = false">
                    Admin Dashboard
                  </router-link>
                </template>
                <hr />
                <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <router-view />

    <div class="fixed bottom-4 right-4 space-y-2 z-50">
      <div
        v-for="toast in notificationStore.toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg text-white transition-all',
          {
            'bg-green-500': toast.type === 'success',
            'bg-red-500': toast.type === 'error',
            'bg-blue-500': toast.type === 'info',
            'bg-yellow-500': toast.type === 'warning',
          },
        ]"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, onMounted } from 'vue' // ĐÃ SỬA: Import thêm computed
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { initSocket, disconnectSocket, onNewNotification } from '@/utils/socket'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const showUserMenu = ref(false)

// ĐÃ SỬA: Tạo biến kiểm tra Admin
const isAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

onMounted(() => {
  authStore.restoreSession()
})

watchEffect(() => {
  if (authStore.user?.id) {
    initSocket(authStore.user.id)
    onNewNotification((data) => {
      notificationStore.addNotification(data)
    })
  } else {
    disconnectSocket()
  }
})

const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
}
</script>