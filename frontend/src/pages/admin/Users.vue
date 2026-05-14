<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Quản lý người dùng</h1>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <div v-else class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="text-left px-4 py-3">Tên</th>
              <th class="text-left px-4 py-3">Email</th>
              <th class="text-left px-4 py-3">Điện thoại</th>
              <th class="text-left px-4 py-3">Vai trò</th>
              <th class="text-left px-4 py-3">Hồ sơ (Thợ)</th> <th class="text-left px-4 py-3">Trạng thái</th>
              <th class="text-left px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">{{ user.full_name || 'Chưa cập nhật' }}</td>
              <td class="px-4 py-3">{{ user.email }}</td>
              <td class="px-4 py-3">{{ user.phone }}</td>
              <td class="px-4 py-3">
                <span :class="[
                  'text-xs px-2 py-1 rounded font-semibold',
                  user.role === 'worker' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]">
                  {{ user.role }}
                </span>
              </td>
              
              <td class="px-4 py-3">
                <div v-if="user.role === 'worker'" class="flex flex-col gap-1 text-xs">
                  <a v-if="user.cccd_front_url" :href="getImageUrl(user.cccd_front_url)" target="_blank" class="text-blue-600 hover:underline">
                    🖼️ CCCD (Trước)
                  </a>
                  <a v-if="user.cccd_back_url" :href="getImageUrl(user.cccd_back_url)" target="_blank" class="text-blue-600 hover:underline">
                    🖼️ CCCD (Sau)
                  </a>
                  <a v-if="user.certificate_url" :href="getImageUrl(user.certificate_url)" target="_blank" class="text-green-600 hover:underline">
                    📄 Chứng chỉ
                  </a>
                  <span v-if="!user.cccd_front_url && !user.cccd_back_url" class="text-gray-400 italic">Chưa có ảnh</span>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>

              <td class="px-4 py-3">
                <span
                  :class="[
                    'text-xs px-2 py-1 rounded font-bold',
                    {
                      'bg-green-100 text-green-800': !user.is_locked,
                      'bg-red-100 text-red-800': user.is_locked,
                    },
                  ]"
                >
                  {{ !user.is_locked ? 'Hoạt động' : 'Bị chặn' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="!user.is_locked"
                  @click="blockUser(user.id)"
                  class="btn-danger text-xs px-3 py-1 rounded"
                >
                  Chặn
                </button>
                
                <button
                  v-else
                  @click="unblockUser(user.id)"
                  class="btn-success text-xs px-3 py-1 rounded"
                >
                  Bỏ chặn
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { getUsers, updateUserLock } from '@/services/adminService'

const notificationStore = useNotificationStore()
const users = ref([])
const loading = ref(false)

// ĐÃ THÊM: Hàm xử lý đường dẫn ảnh tự động nối cổng Backend
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res.data
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
}

const blockUser = async (userId) => {
  if (!confirm('Chặn người dùng này?')) return
  try {
    await updateUserLock(userId, true)
    fetchUsers() // ĐÃ SỬA: Đổi loadUsers() thành fetchUsers()
    notificationStore.success('Chặn người dùng thành công')
  } catch (err) {
    notificationStore.error('Lỗi khi chặn người dùng')
  }
}

const unblockUser = async (userId) => {
  if (!confirm('Bỏ chặn người dùng này?')) return
  try {
    await updateUserLock(userId, false)
    fetchUsers() // ĐÃ SỬA: Đổi loadUsers() thành fetchUsers()
    notificationStore.success('Bỏ chặn người dùng thành công')
  } catch (err) {
    notificationStore.error('Lỗi khi bỏ chặn người dùng')
  }
}

onMounted(fetchUsers)
</script>