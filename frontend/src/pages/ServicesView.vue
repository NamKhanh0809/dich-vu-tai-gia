<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Danh sách dịch vụ</h1>

      <!-- Search & Filter -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm dịch vụ..."
          class="input-field"
        />
        <select v-model="selectedCategory" class="input-field">
          <option value="">Tất cả danh mục</option>
          <option value="repair">Sửa chữa</option>
          <option value="cleaning">Vệ sinh</option>
          <option value="decoration">Trang trí</option>
        </select>
        <button @click="fetchServices" class="btn-primary">Tìm kiếm</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <!-- Services Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="service in services"
          :key="service.id"
          :to="{ name: 'ServiceDetail', params: { id: service.id } }"
          class="card hover:shadow-lg transition cursor-pointer"
        >
          <h3 class="text-lg font-bold mb-2">{{ service.name }}</h3>
          <p class="text-gray-600 text-sm mb-4">{{ service.description }}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-blue-600">{{ service.price_range || 'Liên hệ' }}</span>
            <span class="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full">
              {{ service.category }}
            </span>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && services.length === 0" class="text-center py-12">
        <p class="text-gray-600 mb-4">Không tìm thấy dịch vụ nào</p>
        <button @click="resetFilters" class="btn-primary">Xóa bộ lọc</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllServices } from '@/services/serviceService'

const services = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')

const fetchServices = async () => {
  loading.value = true
  try {
    const res = await getAllServices()
    services.value = res.data
  } catch (err) {
    console.error('Failed to fetch services:', err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  fetchServices()
}

onMounted(fetchServices)
</script>
