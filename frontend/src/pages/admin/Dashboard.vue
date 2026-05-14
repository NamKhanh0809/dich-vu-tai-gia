<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div class="card border-l-4 border-blue-500">
          <p class="text-gray-600">Tổng đơn hàng</p>
          <p class="text-4xl font-bold text-blue-600">{{ stats.total_orders || 0 }}</p>
        </div>
        <div class="card border-l-4 border-green-500">
          <p class="text-gray-600">Đơn hoàn thành</p>
          <p class="text-4xl font-bold text-green-600">{{ stats.completed_orders || 0 }}</p>
        </div>
        <div class="card border-l-4 border-yellow-500">
          <p class="text-gray-600">đơn Chờ duyệt</p>
          <p class="text-4xl font-bold text-yellow-600">{{ stats.pending_orders || 0 }}</p>
        </div>
        <div class="card border-l-4 border-red-500">
          <p class="text-gray-600">Đơn bị hủy</p>
          <p class="text-4xl font-bold text-red-600">{{ stats.cancelled_orders || 0 }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <router-link to="/admin/orders/pending" class="card hover:shadow-lg transition">
          <h3 class="text-xl font-bold mb-2">📋 Đơn chờ duyệt</h3>
          <p class="text-gray-600 mb-4">{{ stats.pending_orders || 0 }} đơn cần xử lý</p>
          <span class="text-blue-600 font-bold">Xem chi tiết →</span>
        </router-link>

        <router-link to="/admin/worker-approvals" class="card hover:shadow-lg transition">
          <h3 class="text-xl font-bold mb-2">👥 Duyệt thợ</h3>
          <p class="text-gray-600 mb-4">{{ stats.pending_workers || 0 }} hồ sơ chờ duyệt</p>
          <span class="text-green-600 font-bold">Xem chi tiết →</span>
        </router-link>

        <router-link to="/admin/complaints" class="card hover:shadow-lg transition">
          <h3 class="text-xl font-bold mb-2">⚠️ Khiếu nại</h3>
          <p class="text-gray-600 mb-4">{{ stats.pending_complaints || 0 }} khiếu nại mới</p>
          <span class="text-red-600 font-bold">Xem chi tiết →</span>
        </router-link>

        <router-link to="/admin/users" class="card hover:shadow-lg transition">
          <h3 class="text-xl font-bold mb-2">👤 Quản lý người dùng</h3>
          <p class="text-gray-600 mb-4">Xem, chặn, quản lý tài khoản</p>
          <span class="text-blue-600 font-bold">Xem chi tiết →</span>
        </router-link>

        <router-link to="/admin/services" class="card hover:shadow-lg transition">
          <h3 class="text-xl font-bold mb-2">🔧 Quản lý dịch vụ</h3>
          <p class="text-gray-600 mb-4">Thêm, sửa, xóa dịch vụ</p>
          <span class="text-purple-600 font-bold">Xem chi tiết →</span>
        </router-link>

        <router-link to="/admin/reports" class="card hover:shadow-lg transition">
          <h3 class="text-xl font-bold mb-2">📊 Báo cáo thống kê</h3>
          <p class="text-gray-600 mb-4">Xem doanh số, thống kê chi tiết</p>
          <span class="text-green-600 font-bold">Xem chi tiết →</span>
        </router-link>
      </div>

      <!-- Recent Orders -->
      <div class="mt-12 card">
        <h2 class="text-2xl font-bold mb-6">Đơn hàng gần đây</h2>
        <div v-if="recentOrders.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 border-b">
              <tr>
                <th class="text-left px-4 py-2">ID</th>
                <th class="text-left px-4 py-2">Khách</th>
                <th class="text-left px-4 py-2">Dịch vụ</th>
                <th class="text-left px-4 py-2">Trạng thái</th>
                <th class="text-left px-4 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-2">#{{ order.id }}</td>
                <td class="px-4 py-2">{{ order.customer_name }}</td>
                <td class="px-4 py-2">{{ order.service_name }}</td>
                <td class="px-4 py-2">
                  <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-4 py-2">{{ formatDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-600">Không có đơn hàng gần đây</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminStats } from '@/services/adminService'

const stats = ref({})
const recentOrders = ref([])

const fetchStats = async () => {
  try {
    const res = await getAdminStats()
    stats.value = res.data
    recentOrders.value = res.data.recent_orders || []
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

const formatDate = (datetime) => {
  return new Date(datetime).toLocaleString('vi-VN')
}

onMounted(fetchStats)
</script>
