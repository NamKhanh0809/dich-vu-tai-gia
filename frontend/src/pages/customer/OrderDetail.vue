<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <router-link to="/my-orders" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Quay lại danh sách
      </router-link>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <div v-else-if="order" class="space-y-6">
        <div class="card bg-white p-6 rounded shadow">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold">Đơn hàng #{{ order.id }}</h1>
            <span
              :class="[
                'px-4 py-2 rounded-full font-bold',
                {
                  'bg-yellow-100 text-yellow-800': order.status === 'pending_approval' || order.status === 'pending',
                  'bg-blue-100 text-blue-800': order.status === 'assigned',
                  'bg-purple-100 text-purple-800': order.status === 'in_progress',
                  'bg-green-100 text-green-800': order.status === 'completed',
                  'bg-red-100 text-red-800': order.status === 'cancelled',
                },
              ]"
            >
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">Dịch vụ</p>
              <ul v-if="order.services && order.services.length">
                <li v-for="svc in order.services" :key="svc.id" class="font-bold text-lg">
                  - {{ svc.name }}
                </li>
              </ul>
              <p v-else class="font-bold text-lg">{{ order.service_name || 'Đang cập nhật' }}</p>
            </div>
            <div>
              <p class="text-gray-600">Giá</p>
              <p class="font-bold text-lg text-blue-600">{{ formatCurrency(order.total_amount) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Ngày tạo</p>
              <p class="font-bold">{{ formatDate(order.created_at) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Thời gian làm việc</p>
              <p class="font-bold">{{ formatDate(order.scheduled_datetime) }}</p>
            </div>
          </div>
        </div>

        <div class="card bg-white p-6 rounded shadow">
          <h2 class="text-xl font-bold mb-4">📍 Địa chỉ thi công</h2>
          <p class="text-gray-700">{{ order.address || order.full_address }}</p>
        </div>

        <div class="card bg-white p-6 rounded shadow">
          <h2 class="text-xl font-bold mb-4">👷 Thợ phụ trách</h2>
          <div v-if="order.workers && order.workers.length > 0" class="space-y-4">
            <div 
              v-for="worker in order.workers" 
              :key="worker.worker_id" 
              class="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
  <p class="font-bold text-lg">
    {{ worker.full_name }} 
    <span class="ml-2 text-yellow-500 text-sm">
      {{ worker.avg_rating }} ★
    </span>
  </p>
  <p class="text-gray-600">SĐT: {{ worker.phone }}</p>
</div>
              <button 
                v-if="order.status === 'completed'" 
                @click="openReviewModal(worker)" 
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Đánh giá thợ
              </button>
            </div>
          </div>
          <p v-else class="text-gray-500 italic">Chưa có thợ nào được phân công.</p>
        </div>

        <div v-if="order.note || order.admin_note" class="card bg-white p-6 rounded shadow">
          <h2 class="text-xl font-bold mb-4">📝 Ghi chú</h2>
          <p v-if="order.note" class="text-gray-700 mb-2"><span class="font-semibold">Khách hàng:</span> {{ order.note }}</p>
          <p v-if="order.admin_note" class="text-gray-700"><span class="font-semibold">Hệ thống:</span> {{ order.admin_note }}</p>
        </div>

        <div class="card bg-white p-6 rounded shadow">
          <h2 class="text-xl font-bold mb-6">📅 Lịch sử đơn hàng</h2>
          <div class="space-y-4">
            <div v-for="activity in timeline" :key="activity.id" class="flex gap-4">
              <div class="w-4 h-4 rounded-full bg-blue-600 mt-1 flex-shrink-0"></div>
              <div>
                <p class="font-bold">{{ activity.action }}</p>
                <p class="text-sm text-gray-600">{{ formatDate(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <router-link to="/my-orders" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 flex-1 text-center">
            Quay lại
          </router-link>
          <button
            v-if="order.status === 'pending' || order.status === 'pending_approval' || order.status === 'assigned'"
            @click="handleCancelOrder"
            class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex-1"
          >
            Hủy đơn
          </button>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-red-600">Không tìm thấy đơn hàng</p>
      </div>

      <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <h3 class="text-2xl font-bold mb-2 text-center">Đánh giá thợ</h3>
          <p class="text-center text-gray-600 mb-6 font-semibold">{{ selectedWorkerName }}</p>
          
          <div class="flex justify-center space-x-2 mb-6">
            <span 
              v-for="star in 5" 
              :key="star" 
              @click="reviewRating = star" 
              class="cursor-pointer text-4xl transition-colors" 
              :class="star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </span>
          </div>
          
          <textarea 
            v-model="reviewComment" 
            class="w-full border border-gray-300 rounded p-3 mb-6 focus:ring-blue-500 focus:border-blue-500" 
            rows="3" 
            placeholder="Chia sẻ trải nghiệm của bạn về thợ này..."
          ></textarea>
          
          <div class="flex justify-end gap-3">
            <button @click="closeReviewModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Hủy
            </button>
            <button 
              @click="submitReview" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              :disabled="submittingReview"
            >
              {{ submittingReview ? 'Đang gửi...' : 'Gửi đánh giá' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { getOrderDetail, cancelOrder as cancelOrderAPI } from '@/services/orderService'
import apiClient from '@/services/api' 

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()
const order = ref(null)
const loading = ref(false)
const timeline = ref([])

// Biến cho Modal Đánh giá
const showReviewModal = ref(false)
const selectedWorkerId = ref(null)
const selectedWorkerName = ref('')
const reviewRating = ref(5) 
const reviewComment = ref('')
const submittingReview = ref(false)

const fetchOrder = async () => {
  loading.value = true
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.data
    buildTimeline()
  } catch (err) {
    console.error('Failed to fetch order:', err)
  } finally {
    loading.value = false
  }
}

const buildTimeline = () => {
  if (!order.value) return
  timeline.value = [
    { id: 1, action: 'Đơn được tạo', timestamp: order.value.created_at },
    ...(order.value.assigned_at
      ? [{ id: 2, action: 'Đã giao cho thợ', timestamp: order.value.assigned_at }]
      : []),
    ...(order.value.started_at
      ? [{ id: 3, action: 'Thợ bắt đầu làm', timestamp: order.value.started_at }]
      : []),
    ...(order.value.completed_at
      ? [{ id: 4, action: 'Hoàn thành dịch vụ', timestamp: order.value.completed_at }]
      : []),
  ]
}

const formatStatus = (status) => {
  const statuses = {
    pending_approval: 'Chờ duyệt',
    pending: 'Chờ duyệt',
    assigned: 'Đã giao thợ',
    in_progress: 'Đang làm',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  }
  return statuses[status] || status
}

const formatDate = (datetime) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('vi-VN')
}

// ĐÃ SỬA: Thêm hàm formatCurrency chống lỗi Null để tính toán số tiền
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) {
    return 'Chưa xác định';
  }
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(Number(amount));
}

const handleCancelOrder = async () => {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn này?')) return
  try {
    await cancelOrderAPI(route.params.id)
    notificationStore.success('Hủy đơn thành công')
    await fetchOrder()
  } catch (err) {
    console.error('Failed to cancel order:', err)
    notificationStore.error('Lỗi khi hủy đơn')
  }
}

const openReviewModal = (worker) => {
  selectedWorkerId.value = worker.worker_id
  selectedWorkerName.value = worker.full_name
  reviewRating.value = 5
  reviewComment.value = ''
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
}

const submitReview = async () => {
  if (reviewRating.value < 1) {
    notificationStore.error('Vui lòng chọn số sao để đánh giá')
    return
  }
  
  submittingReview.value = true
  try {
    await apiClient.post('/reviews', {
      order_id: order.value.id,
      worker_id: selectedWorkerId.value,
      rating: reviewRating.value,
      comment: reviewComment.value
    })
    
    notificationStore.success('Đánh giá thành công! Cảm ơn bạn.')
    closeReviewModal()
  } catch (err) {
    console.error(err)
    notificationStore.error(err.response?.data?.message || 'Lỗi khi gửi đánh giá')
  } finally {
    submittingReview.value = false
  }
}

onMounted(fetchOrder)
</script>