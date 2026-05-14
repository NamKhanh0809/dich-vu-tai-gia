<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Đơn hàng chờ duyệt</h1>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in pendingOrders"
          :key="order.id"
          class="card"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">Đơn #{{ order.id }} - {{ order.service_name }}</h3>
              <p class="text-gray-600">Khách: {{ order.customer_name }} | Điện thoại: {{ order.customer_phone }}</p>
            </div>
            <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
              Chờ duyệt
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p class="text-gray-600">Địa chỉ</p>
              <p class="font-bold">{{ order.address }}</p>
            </div>
            <div>
              <p class="text-gray-600">Thời gian</p>
              <p class="font-bold">{{ formatDate(order.scheduled_datetime) }}</p>
            </div>
          </div>

          <div v-if="order.note" class="bg-gray-50 p-3 rounded mb-4 text-sm">
            <strong>Ghi chú:</strong> {{ order.note }}
          </div>

          <button @click="openApproveModal(order)" class="btn-primary text-sm">
            Phê duyệt & giao thợ
          </button>
        </div>
      </div>

      <div v-if="!loading && pendingOrders.length === 0" class="text-center py-12">
        <p class="text-gray-600">Không có đơn hàng chờ duyệt</p>
      </div>

      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 overflow-visible">
          <h2 class="text-2xl font-bold mb-6">Giao đơn cho thợ</h2>

          <div class="mb-6">
            <label class="form-label mb-1">Chọn thợ (có thể chọn nhiều)</label>
            <multiselect
              v-model="selectedWorkers"
              :options="workerOptions"
              mode="tags"
              valueProp="id"
              label="name"
              :searchable="true"
              placeholder="Tìm và chọn thợ..."
            />
          </div>

          <div class="mb-6">
            <label for="adminNote" class="form-label">Ghi chú (tuỳ chọn)</label>
            <textarea
              v-model="adminNote"
              id="adminNote"
              class="input-field"
              placeholder="Ghi chú thêm"
              rows="3"
            ></textarea>
          </div>

          <div class="flex gap-2">
            <button
              @click="handleApprove"
              :disabled="selectedWorkers.length === 0 || approving"
              class="btn-primary flex-1"
            >
              {{ approving ? 'Đang xử lý...' : 'Phê duyệt' }}
            </button>
            <button
              @click="closeModal"
              class="btn-secondary flex-1"
            >
              Hủy
            </button>
          </div>

          <div class="mt-6 pt-6 border-t">
            <label for="rejectReason" class="form-label">Hoặc từ chối đơn</label>
            <textarea
              v-model="rejectReason"
              id="rejectReason"
              placeholder="Lý do từ chối"
              class="input-field mb-3"
              rows="2"
            ></textarea>
            <button
              @click="handleReject"
              :disabled="!rejectReason"
              class="w-full btn-danger"
            >
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SỬA Ở ĐÂY: Import thêm thư viện Multiselect và hàm computed
import { ref, onMounted, computed } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { useNotificationStore } from '@/stores/notification'
import { getPendingOrders, approveOrder, rejectOrder } from '@/services/adminService'
import { getAvailableWorkers } from '@/services/workerService'

const notificationStore = useNotificationStore()
const pendingOrders = ref([])
const availableWorkers = ref([])
const loading = ref(false)
const approving = ref(false)
const showModal = ref(false)
const selectedOrderId = ref(null)

// SỬA Ở ĐÂY: Chuyển biến lưu thợ thành mảng (Array)
const selectedWorkers = ref([]) 
const adminNote = ref('')
const rejectReason = ref('')

// Format lại danh sách thợ để hiển thị đẹp trong Multiselect
const workerOptions = computed(() => {
  return availableWorkers.value.map(w => ({
    id: w.id,
    // ĐÃ SỬA: Đổi avg_rating thành average_rating để khớp với Backend
    name: `${w.full_name || w.email} (★ ${w.average_rating || 0}/5)`
  }))
})

const fetchPendingOrders = async () => {
  loading.value = true
  try {
    const res = await getPendingOrders()
    pendingOrders.value = res.data
  } catch (err) {
    console.error('Failed to fetch pending orders:', err)
  } finally {
    loading.value = false
  }
}

const fetchAvailableWorkers = async () => {
  try {
    const res = await getAvailableWorkers()
    availableWorkers.value = res.data
  } catch (err) {
    console.error('Failed to fetch workers:', err)
  }
}

const openApproveModal = async (order) => {
  selectedOrderId.value = order.id
  await fetchAvailableWorkers()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedOrderId.value = null
  selectedWorkers.value = [] // SỬA Ở ĐÂY: Xoá trắng mảng khi đóng
  adminNote.value = ''
  rejectReason.value = ''
}

const handleApprove = async () => {
  if (selectedWorkers.value.length === 0) {
    notificationStore.error('Vui lòng chọn ít nhất 1 thợ')
    return
  }

  approving.value = true
  try {
    await approveOrder(selectedOrderId.value, {
      workerIds: selectedWorkers.value, // SỬA Ở ĐÂY: Gửi biến workerIds (số nhiều) lên Backend
      adminNote: adminNote.value,
    })
    notificationStore.success('Phê duyệt đơn hàng thành công')
    closeModal()
    fetchPendingOrders()
  } catch (err) {
    notificationStore.error('Lỗi khi phê duyệt đơn hàng')
  } finally {
    approving.value = false
  }
}

const handleReject = async () => {
  if (!rejectReason.value) {
    notificationStore.error('Vui lòng nhập lý do từ chối')
    return
  }

  approving.value = true
  try {
    await rejectOrder(selectedOrderId.value, {
      admin_note: rejectReason.value,
    })
    notificationStore.success('Từ chối đơn hàng thành công')
    closeModal()
    fetchPendingOrders()
  } catch (err) {
    notificationStore.error('Lỗi khi từ chối đơn hàng')
  } finally {
    approving.value = false
  }
}

const formatDate = (datetime) => {
  return new Date(datetime).toLocaleString('vi-VN')
}

onMounted(fetchPendingOrders)
</script>