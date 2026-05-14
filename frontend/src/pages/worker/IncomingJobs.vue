<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Đơn hàng được giao</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="card"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">Đơn #{{ order.id }} - {{ order.service_name }}</h3>
              <p class="text-gray-600">Khách: <strong>{{ order.customer_name }}</strong></p>
              <p class="text-gray-600">Điện thoại: <strong>{{ order.customer_phone }}</strong></p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold',
                {
                  'bg-yellow-100 text-yellow-800': order.status === 'assigned',
                  'bg-blue-100 text-blue-800': order.status === 'in_progress',
                  'bg-green-100 text-green-800': order.status === 'completed',
                },
              ]"
            >
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-gray-600 text-sm">Địa chỉ thi công</p>
              <p class="font-bold">📍 {{ order.address }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Thời gian làm việc</p>
              <p class="font-bold">🕐 {{ formatDate(order.scheduled_datetime) }}</p>
            </div>
          </div>

          <div v-if="order.note" class="bg-gray-50 p-3 rounded mb-4 text-sm">
            <strong>Ghi chú từ khách:</strong> {{ order.note }}
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              v-if="order.status === 'assigned'"
              @click="updateStatus(order.id, 'in_progress')"
              class="btn-primary text-sm"
            >
              ✓ Bắt đầu làm
            </button>
            <button
              v-if="order.status === 'in_progress'"
              @click="updateStatus(order.id, 'completed')"
              class="btn-success text-sm"
            >
              ✓ Hoàn thành
            </button>
            <button
              @click="contactCustomer(order.customer_phone)"
              class="btn-secondary text-sm"
            >
              📞 Liên hệ khách
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && orders.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">Bạn hiện không có đơn hàng nào được giao</p>
        <p class="text-sm text-gray-600">Hãy chờ admin giao đơn hàng từ khách</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { getWorkerOrders, updateOrderStatus } from '@/services/orderService'
import { getSocket } from '@/utils/socket'

const notificationStore = useNotificationStore()
const orders = ref([])
const loading = ref(false)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getWorkerOrders()
    orders.value = res.data
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (orderId, newStatus) => {
  try {
    await updateOrderStatus(orderId, newStatus)
    notificationStore.success('Cập nhật trạng thái thành công')
    fetchOrders()
  } catch (err) {
    notificationStore.error('Lỗi khi cập nhật trạng thái')
  }
}

const contactCustomer = (phone) => {
  // Open phone dialer or messaging app
  window.location.href = `tel:${phone}`
}

const formatStatus = (status) => {
  const statuses = {
    assigned: 'Chờ bắt đầu',
    in_progress: 'Đang làm',
    completed: 'Đã hoàn thành',
  }
  return statuses[status] || status
}

const formatDate = (datetime) => {
  return new Date(datetime).toLocaleString('vi-VN')
}

onMounted(() => {
  fetchOrders()

  // Listen for new orders
  const socket = getSocket()
  if (socket) {
    socket.on('order_assigned', () => {
      fetchOrders()
    })
  }
})
</script>
