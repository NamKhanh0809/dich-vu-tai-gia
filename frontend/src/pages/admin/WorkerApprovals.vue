<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Duyệt thợ</h1>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="worker in pendingWorkers"
          :key="worker.id"
          class="card"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">{{ worker.full_name }}</h3>
              <p class="text-gray-600">{{ worker.email }} | {{ worker.phone }}</p>
            </div>
            <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
              Chờ duyệt
            </span>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p class="text-gray-600">CCCD (mặt trước)</p>
              <a v-if="worker.cccd_front_url" :href="getImageUrl(worker.cccd_front_url)" target="_blank" class="text-blue-600 hover:underline">
                Xem ảnh →
              </a>
              <span v-else class="text-gray-400">Không có</span>
            </div>
            <div>
              <p class="text-gray-600">CCCD (mặt sau)</p>
              <a v-if="worker.cccd_back_url" :href="getImageUrl(worker.cccd_back_url)" target="_blank" class="text-blue-600 hover:underline">
                Xem ảnh →
              </a>
              <span v-else class="text-gray-400">Không có</span>
            </div>
            <div>
              <p class="text-gray-600">Chứng chỉ</p>
              <a v-if="worker.certificate_url" :href="getImageUrl(worker.certificate_url)" target="_blank" class="text-blue-600 hover:underline">
                Xem tài liệu →
              </a>
              <span v-else class="text-gray-400">Không có</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="handleApproveWorker(worker.user_id)"
              class="btn-success text-sm"
            >
              ✓ Phê duyệt
            </button>
            
            <button
              @click="handleRejectWorker(worker.user_id)"
              class="btn-danger text-sm"
            >
              ✗ Từ chối
            </button>
          </div>
        </div>
      </div>

      <div v-if="!loading && pendingWorkers.length === 0" class="text-center py-12">
        <p class="text-gray-600">Không có hồ sơ thợ chờ duyệt</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { getWorkerApprovals, approveWorker, rejectWorker } from '@/services/adminService'

const notificationStore = useNotificationStore()
const pendingWorkers = ref([])
const loading = ref(false)

// ĐÃ THÊM: Hàm xử lý đường dẫn ảnh tự động nối cổng Backend
const getImageUrl = (url) => {
  if (!url) return '';
  // Nếu url đã có http (chuẩn) thì giữ nguyên, nếu chưa có thì nối thêm
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
}

const fetchWorkerApprovals = async () => {
  loading.value = true
  try {
    const res = await getWorkerApprovals()
    pendingWorkers.value = res.data
  } catch (err) {
    console.error('Failed to fetch worker approvals:', err)
  } finally {
    loading.value = false
  }
}

const handleApproveWorker = async (workerId) => {
  try {
    await approveWorker(workerId, { admin_note: 'Approved' })
    notificationStore.success('Phê duyệt thợ thành công')
    await fetchWorkerApprovals()
  } catch (err) {
    console.error('Failed to approve worker:', err)
    notificationStore.error('Lỗi khi phê duyệt')
  }
}

const handleRejectWorker = async (workerId) => {
  const reason = prompt('Nhập lý do từ chối:')
  if (!reason) return
  try {
    await rejectWorker(workerId, { admin_note: reason })
    notificationStore.success('Từ chối hồ sơ thành công')
    await fetchWorkerApprovals()
  } catch (err) {
    console.error('Failed to reject worker:', err)
    notificationStore.error('Lỗi khi từ chối hồ sơ')
  }
}

onMounted(fetchWorkerApprovals)
</script>