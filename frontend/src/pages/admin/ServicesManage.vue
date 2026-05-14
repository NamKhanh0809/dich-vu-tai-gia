<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Quản lý dịch vụ</h1>
        
        <div class="flex gap-4">
          <input 
            type="file" 
            ref="fileInput" 
            accept=".csv" 
            class="hidden" 
            @change="handleFileUpload" 
          />
          <button @click="$refs.fileInput.click()" class="btn-secondary flex items-center gap-2">
            <span>📁 Import CSV</span>
          </button>
          <button @click="showAddForm = true" class="btn-primary">+ Thêm dịch vụ</button>
        </div>
      </div>

      <div v-if="showAddForm" class="card mb-8 p-6 bg-white rounded shadow">
        <h2 class="text-xl font-bold mb-6">Thêm dịch vụ mới</h2>
        <form @submit.prevent="addService" class="space-y-4">
          <input v-model="newService.name" placeholder="Tên dịch vụ" required class="input-field border p-2 w-full rounded" />
          <textarea v-model="newService.description" placeholder="Mô tả" required class="input-field border p-2 w-full rounded" rows="3"></textarea>
          <input v-model="newService.price_range" placeholder="Khoảng giá (VD: 100k - 500k)" required class="input-field border p-2 w-full rounded" />
          <input v-model.number="newService.base_price" type="number" placeholder="Giá cơ bản (VD: 100000)" class="input-field border p-2 w-full rounded" />
          <input v-model="newService.image_url" placeholder="Link hình ảnh (Tùy chọn)" class="input-field border p-2 w-full rounded" />
          
          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn-primary flex-1 bg-blue-600 text-white p-2 rounded">Lưu Dịch Vụ</button>
            <button type="button" @click="showAddForm = false" class="btn-secondary flex-1 bg-gray-300 p-2 rounded">Hủy</button>
          </div>
        </form>
      </div>

      <div class="space-y-4">
        <div
          v-for="service in services"
          :key="service.id"
          class="card bg-white p-4 rounded shadow flex justify-between items-start"
        >
          <div>
            <h3 class="text-lg font-bold">{{ service.name }}</h3>
            <p class="text-gray-600">{{ service.description }}</p>
            <div class="mt-2 flex gap-4 text-sm font-medium">
              <span v-if="service.price_range">Khoảng giá: {{ service.price_range }}</span>
              <span v-if="service.base_price" class="text-green-600">Cơ bản: {{ service.base_price }}đ</span>
            </div>
          </div>
          <button @click="deleteService(service.id)" class="btn-danger text-sm bg-red-500 text-white px-3 py-1 rounded">
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { getAllServices, createService, deleteServiceApi, uploadServicesCSV } from '@/services/serviceService'

const notificationStore = useNotificationStore()
const services = ref([])
const showAddForm = ref(false)
const fileInput = ref(null)

// Map các trường đúng với bảng ở DB dựa theo adminController.js
const newService = ref({ name: '', description: '', image_url: '', price_range: '', base_price: null })

const fetchServices = async () => {
  try {
    const res = await getAllServices()
    // Nếu API trả về res.data có mảng hoặc trực tiếp mảng, tự điều chỉnh cho đúng
    services.value = res.data || res
  } catch (err) {
    console.error('Failed to fetch services:', err)
  }
}

const addService = async () => {
  try {
    await createService(newService.value)
    notificationStore.success('Thêm dịch vụ thành công')
    showAddForm.value = false
    newService.value = { name: '', description: '', image_url: '', price_range: '', base_price: null }
    fetchServices()
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Lỗi khi thêm dịch vụ'
    notificationStore.error(errorMsg)
  }
}

const deleteService = async (serviceId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return
  try {
    await deleteServiceApi(serviceId)
    notificationStore.success('Xóa dịch vụ thành công')
    fetchServices()
  } catch (error) {
    notificationStore.error('Xóa dịch vụ thất bại!')
  }
}

const handleFileUpload = async (event) => {
  // Lấy file thô từ input
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.csv')) {
    notificationStore.error('Vui lòng chỉ chọn file .csv');
    return;
  }

  try {
    notificationStore.info('Đang xử lý dữ liệu CSV...');
    
    // TRUYỀN TRỰC TIẾP BIẾN file, KHÔNG BỌC TRONG NGOẶC NHỌN { file }
    const res = await uploadServicesCSV(file);
    
    notificationStore.success(res.data?.message || 'Import thành công!');
    await fetchServices(); 
  } catch (error) {
    console.error("Lỗi chi tiết:", error);
    const errorMsg = error.response?.data?.message || 'Lỗi server khi xử lý file';
    notificationStore.error(errorMsg);
  } finally {
    // Reset lại ô chọn file
    event.target.value = '';
  }
}

onMounted(fetchServices)
</script>