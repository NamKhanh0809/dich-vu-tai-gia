<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Lịch sử làm việc</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <!-- Work History List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in workHistory"
          :key="order.id"
          class="card"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">{{ order.service_name }}</h3>
              <p class="text-gray-600 text-sm">Đơn #{{ order.id }}</p>
            </div>
            <span class="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
              ✓ Hoàn thành
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p class="text-gray-600">Khách hàng</p>
              <p class="font-bold">{{ order.customer_name }}</p>
            </div>
           <div>
  <p class="text-gray-600">Ngày làm</p>
  <p class="font-bold">{{ formatDate(order.updated_at) }}</p> 
</div>
<div>
  <p class="text-gray-600">Lương nhận</p>
  <p class="font-bold text-green-600">{{ order.total_amount || '0' }} VND</p>
</div>
          </div>

          <!-- Review Section -->
          <div v-if="order.review" class="bg-blue-50 p-3 rounded mb-4">
            <div class="flex items-center mb-1">
              <strong>Đánh giá: </strong>
              <span class="text-yellow-500 ml-2">★ {{ order.review.rating }}/5</span>
            </div>
            <p class="text-sm text-gray-700">{{ order.review.comment }}</p>
          </div>

          <!-- Action Button -->
          <button @click="contactCustomer(order.customer_phone)" class="btn-secondary text-sm">
            📞 Liên hệ khách
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && workHistory.length === 0" class="text-center py-12">
        <p class="text-gray-600">Bạn chưa hoàn thành công việc nào</p>
      </div>

      <!-- Stats -->
      <div v-if="workHistory.length > 0" class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card text-center">
          <p class="text-gray-600">Tổng công việc hoàn thành</p>
          <p class="text-3xl font-bold text-blue-600">{{ workHistory.length }}</p>
        </div>
        <div class="card text-center">
          <p class="text-gray-600">Đánh giá trung bình</p>
          <p class="text-3xl font-bold text-yellow-500">{{ averageRating }}/5</p>
        </div>
       <div class="card text-center">
  <p class="text-gray-600">Tổng thu nhập</p>
  <p class="text-3xl font-bold text-green-600">{{ backendTotalEarnings }} VND</p>
</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getWorkHistory } from '@/services/orderService'

const workHistory = ref([])
const backendTotalEarnings = ref(0) // Khai báo biến để hứng tổng thu nhập từ backend
const loading = ref(false)

// Tính điểm đánh giá trung bình
const averageRating = computed(() => {
  if (workHistory.value.length === 0) return 0
  const reviews = workHistory.value.filter(o => o.review)
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, o) => acc + (o.review.rating || 0), 0)
  return (sum / reviews.length).toFixed(1)
})

const fetchWorkHistory = async () => {
  loading.value = true
  try {
    const res = await getWorkHistory()
    
    // SỬA Ở ĐÂY: Trỏ sâu vào đúng mảng orders trong object trả về
    if (res.data && res.data.history && res.data.history.orders) {
      workHistory.value = res.data.history.orders
    } else {
      workHistory.value = []
    }

    // SỬA Ở ĐÂY: Lấy giá trị totalEarnings từ backend gán vào biến
    backendTotalEarnings.value = res.data.totalEarnings || 0

  } catch (err) {
    console.error('Failed to fetch work history:', err)
  } finally {
    loading.value = false
  }
}

const contactCustomer = (phone) => {
  window.location.href = `tel:${phone}`
}

const formatDate = (datetime) => {
  if (!datetime) return 'N/A' // Tránh lỗi Invalid Date nếu không có ngày
  return new Date(datetime).toLocaleString('vi-VN')
}

onMounted(fetchWorkHistory)
</script>