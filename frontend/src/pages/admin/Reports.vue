<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Báo cáo thống kê</h1>

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
        <div class="card border-l-4 border-purple-500">
          <p class="text-gray-600">Tổng doanh thu</p>
          <p class="text-2xl font-bold text-purple-600">
            {{ formatCurrency(stats.total_revenue || 0) }}
          </p>
        </div>
        <div class="card border-l-4 border-yellow-500">
          <p class="text-gray-600">Tỷ lệ hoàn thành</p>
          <p class="text-4xl font-bold text-yellow-600">{{ completionRate }}%</p>
        </div>
      </div>

      <!-- Reports by Period -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Monthly Report -->
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Báo cáo tháng này</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span>Đơn hàng mới:</span>
              <span class="font-bold">{{ monthlyStats.new_orders || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Đơn hoàn thành:</span>
              <span class="font-bold">{{ monthlyStats.completed || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Đơn hủy:</span>
              <span class="font-bold">{{ monthlyStats.cancelled || 0 }}</span>
            </div>
            <div class="flex justify-between text-green-600 font-bold">
              <span>Doanh thu:</span>
              <span>{{ formatCurrency(monthlyStats.revenue || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Services -->
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Dịch vụ phổ biến</h2>
          <div class="space-y-3">
            <div v-for="service in topServices" :key="service.id" class="flex justify-between">
              <span>{{ service.name }}</span>
              <span class="font-bold">{{ service.count }} đơn</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Worker Rankings -->
      <div class="mt-6 card">
        <h2 class="text-xl font-bold mb-6">Xếp hạng thợ (tháng này)</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 border-b">
              <tr>
                <th class="text-left px-4 py-3">Thợ</th>
                <th class="text-left px-4 py-3">Đơn hoàn thành</th>
                <th class="text-left px-4 py-3">Đánh giá trung bình</th>
                <th class="text-left px-4 py-3">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(worker, idx) in topWorkers" :key="worker.id" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">{{ idx + 1 }}. {{ worker.name }}</td>
                <td class="px-4 py-3">{{ worker.completed_orders }}</td>
                <td class="px-4 py-3">★ {{ worker.avg_rating }}/5</td>
                <td class="px-4 py-3 text-green-600 font-bold">{{ formatCurrency(worker.earnings) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getReports, getAdminStats } from '@/services/adminService'

const stats = ref({})
const monthlyStats = ref({})
const topServices = ref([])
const topWorkers = ref([])

const completionRate = computed(() => {
  if (!stats.value.total_orders || stats.value.total_orders === 0) return 0
  return Math.round((stats.value.completed_orders / stats.value.total_orders) * 100)
})

const fetchReports = async () => {
  try {
    const res = await getAdminStats()
    stats.value = res.data

    const reportsRes = await getReports({ period: 'monthly' })
    monthlyStats.value = reportsRes.data.monthly || {}
    topServices.value = reportsRes.data.top_services || []
    topWorkers.value = reportsRes.data.top_workers || []
  } catch (err) {
    console.error('Failed to fetch reports:', err)
  }
}

const formatCurrency = (value) => {
  if (!value) return '0 VND'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' VND'
}

onMounted(fetchReports)
</script>
