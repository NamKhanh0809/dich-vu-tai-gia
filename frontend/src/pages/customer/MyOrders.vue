<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="card hover:shadow-lg transition cursor-pointer"
          @click="goToDetail(order.id)"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">{{ order.service_name }}</h3>
              <p class="text-gray-600 text-sm">Đơn #{{ order.id }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold',
                {
                  'bg-yellow-100 text-yellow-800': order.status === 'pending',
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

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <p class="text-gray-600">Địa chỉ</p>
              <p class="font-bold">{{ order.address }}</p>
            </div>
            <div>
              <p class="text-gray-600">Thời gian</p>
              <p class="font-bold">{{ formatDate(order.scheduled_datetime) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Thợ</p>
              <p class="font-bold">{{ order.worker_names || 'Chờ giao' }}</p>
            </div>
            <div>
              <p class="text-gray-600">Giá</p>
              <p class="font-bold text-blue-600">{{ formatCurrency(order.total_amount) }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="btn-secondary text-sm">
              Chi tiết
            </router-link>
            <button
              v-if="order.status === 'pending' || order.status === 'assigned'"
              @click.stop="cancelOrder(order.id)"
              class="btn-danger text-sm"
            >
              Hủy đơn
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && orders.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
        <router-link to="/booking" class="btn-primary">Đặt dịch vụ ngay</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { getMyOrders, cancelOrder } from '@/services/orderService'

const router = useRouter()
const notificationStore = useNotificationStore()
const orders = ref([])
const loading = ref(false)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getMyOrders()
    orders.value = res.data
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  } finally {
    loading.value = false
  }
}

const goToDetail = (orderId) => {
  router.push({ name: 'OrderDetail', params: { id: orderId } })
}

const cancelOrderHandler = async (orderId) => {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn này?')) return

  try {
    await cancelOrder(orderId)
    notificationStore.success('Hủy đơn thành công')
    fetchOrders()
  } catch (err) {
    notificationStore.error('Lỗi khi hủy đơn')
  }
}

// Cập nhật lại formatStatus
const formatStatus = (status) => {
  const statuses = {
    pending_approval: 'Chờ duyệt', // Bổ sung dòng này
    pending: 'Chờ duyệt',
    assigned: 'Đã giao thợ',
    in_progress: 'Đang làm',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  }
  return statuses[status] || status
}

const formatDate = (datetime) => {
  return new Date(datetime).toLocaleString('vi-VN')
}

// Bổ sung thêm hàm này vào để tính tiền
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) {
    return 'Chưa xác định';
  }
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(Number(amount));
}

onMounted(fetchOrders)
</script>
