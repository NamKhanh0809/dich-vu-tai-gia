<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Quản lý khiếu nại</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <!-- Complaints List -->
      <div v-else class="space-y-4">
        <div
          v-for="complaint in complaints"
          :key="complaint.id"
          class="card"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold">Khiếu nại #{{ complaint.id }}</h3>
              <p class="text-gray-600">Đơn hàng: #{{ complaint.order_id }}</p>
              <p class="text-gray-600">Người khiếu nại: {{ complaint.customer_name }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold',
                {
                  'bg-yellow-100 text-yellow-800': complaint.status === 'pending',
                  'bg-green-100 text-green-800': complaint.status === 'resolved',
                  'bg-red-100 text-red-800': complaint.status === 'rejected',
                },
              ]"
            >
              {{ formatStatus(complaint.status) }}
            </span>
          </div>

          <div class="bg-gray-50 p-4 rounded mb-4">
            <p class="font-bold mb-2">Nội dung khiếu nại:</p>
            <p class="text-gray-700">{{ complaint.description }}</p>
          </div>

          <!-- Action Buttons -->
          <div v-if="complaint.status === 'pending'" class="flex gap-2">
            <button
              @click="handleResolveComplaint(complaint.id)"
              class="btn-success text-sm"
            >
              ✓ Đã xử lý
            </button>
            <button
              @click="handleRejectComplaint(complaint.id)"
              class="btn-danger text-sm"
            >
              ✗ Từ chối
            </button>
          </div>
          <div v-else class="text-sm text-gray-600">
            ✓ Đã xử lý lúc: {{ formatDate(complaint.resolved_at) }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && complaints.length === 0" class="text-center py-12">
        <p class="text-gray-600">Không có khiếu nại nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { getComplaints, resolveComplaint as resolveComplaintAPI } from '@/services/adminService'

const notificationStore = useNotificationStore()
const complaints = ref([])
const loading = ref(false)

const fetchComplaints = async () => {
  loading.value = true
  try {
    const res = await getComplaints()
    complaints.value = res.data
  } catch (err) {
    console.error('Failed to fetch complaints:', err)
  } finally {
    loading.value = false
  }
}

const handleResolveComplaint = async (complaintId) => {
  const resolution = prompt('Nhập nội dung xử lý:')
  if (!resolution) return
  try {
    await resolveComplaintAPI(complaintId, { resolution, action: 'resolve' })
    notificationStore.success('Xử lý khiếu nại thành công')
    await fetchComplaints()
  } catch (err) {
    notificationStore.error('Lỗi khi xử lý khiếu nại')
  }
}

const handleRejectComplaint = async (complaintId) => {
  const resolution = prompt('Nhập lý do từ chối:')
  if (!resolution) return
  try {
    await resolveComplaintAPI(complaintId, { resolution, action: 'reject' })
    notificationStore.success('Từ chối khiếu nại thành công')
    await fetchComplaints()
  } catch (err) {
    notificationStore.error('Lỗi khi từ chối khiếu nại')
  }
}

const formatStatus = (status) => {
  const statuses = {
    pending: 'Chờ xử lý',
    resolved: 'Đã xử lý',
    rejected: 'Đã từ chối',
  }
  return statuses[status] || status
}

const formatDate = (datetime) => {
  return new Date(datetime).toLocaleString('vi-VN')
}

onMounted(fetchComplaints)
</script>
