<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Sổ địa chỉ</h1>
        <button @click="showAddForm = !showAddForm" class="btn-primary">+ Thêm địa chỉ</button>
      </div>

      <!-- Add/Edit Form -->
      <div v-if="showAddForm" class="card mb-8">
        <h2 class="text-xl font-bold mb-6">{{ editingId ? 'Chỉnh sửa' : 'Thêm' }} địa chỉ</h2>
        <form @submit.prevent="submitAddress" class="space-y-4">
          <div>
            <label for="label" class="form-label">Tên địa chỉ (VD: Nhà, Văn phòng)</label>
            <input
              id="label"
              v-model="formData.label"
              type="text"
              required
              class="input-field"
              placeholder="Nhà riêng"
            />
          </div>

          <div>
            <label for="address" class="form-label">Địa chỉ chi tiết</label>
            <input
              id="address"
              v-model="formData.full_address"
              type="text"
              required
              class="input-field"
              placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP HCM"
            />
          </div>

          <div>
            <label for="phone" class="form-label">Số điện thoại</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="input-field"
              placeholder="0901234567"
            />
          </div>

          <div class="flex items-center">
            <input
              id="default"
              v-model="formData.is_default"
              type="checkbox"
              class="h-4 w-4 text-blue-600"
            />
            <label for="default" class="ml-2 text-sm text-gray-600">Đặt làm địa chỉ mặc định</label>
          </div>

          <div class="flex gap-2">
            <button type="submit" :disabled="isSaving" class="btn-primary flex-1">
              {{ isSaving ? 'Đang lưu...' : 'Lưu địa chỉ' }}
            </button>
            <button
              type="button"
              @click="cancelEdit"
              class="btn-secondary flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <!-- Addresses List -->
      <div v-else class="space-y-4">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="card flex justify-between items-start"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-bold">{{ address.label }}</h3>
              <span v-if="address.is_default" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Mặc định
              </span>
            </div>
            <p class="text-gray-600">{{ address.full_address }}</p>
            <p class="text-gray-600">📞 {{ address.phone }}</p>
          </div>

          <div class="flex gap-2">
            <button
              @click="editAddress(address)"
              class="btn-secondary text-sm"
            >
              Sửa
            </button>
            <button
              @click="deleteAddress(address.id)"
              class="btn-danger text-sm"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && addresses.length === 0 && !showAddForm" class="text-center py-12">
        <p class="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
        <button @click="showAddForm = true" class="btn-primary">Thêm địa chỉ đầu tiên</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { getAddresses, createAddress, updateAddress, deleteAddress } from '@/services/addressService'

const notificationStore = useNotificationStore()
const addresses = ref([])
const loading = ref(false)
const isSaving = ref(false)
const showAddForm = ref(false)
const editingId = ref(null)

const formData = ref({
  label: '',
  full_address: '',
  phone: '',
  is_default: false,
})

const fetchAddresses = async () => {
  loading.value = true
  try {
    const res = await getAddresses()
    addresses.value = res.data
  } catch (err) {
    console.error('Failed to fetch addresses:', err)
  } finally {
    loading.value = false
  }
}

const editAddress = (address) => {
  editingId.value = address.id
  formData.value = { ...address }
  showAddForm.value = true
}

const cancelEdit = () => {
  showAddForm.value = false
  editingId.value = null
  formData.value = {
    label: '',
    full_address: '',
    phone: '',
    is_default: false,
  }
}

const submitAddress = async () => {
  isSaving.value = true
  try {
    if (editingId.value) {
      await updateAddress(editingId.value, formData.value)
      notificationStore.success('Cập nhật địa chỉ thành công')
    } else {
      await createAddress(formData.value)
      notificationStore.success('Thêm địa chỉ thành công')
    }
    cancelEdit()
    fetchAddresses()
  } catch (err) {
    notificationStore.error('Lỗi khi lưu địa chỉ')
  } finally {
    isSaving.value = false
  }
}

const deleteAddressHandler = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return
  try {
    await deleteAddress(id)
    notificationStore.success('Xóa địa chỉ thành công')
    fetchAddresses()
  } catch (err) {
    notificationStore.error('Lỗi khi xóa địa chỉ')
  }
}

onMounted(fetchAddresses)
</script>
