<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <router-link to="/services" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Quay lại danh sách
      </router-link>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Đang tải...</p>
      </div>

      <div v-else-if="service" class="card">
        <!-- Service Header -->
        <div class="border-b pb-6 mb-6">
          <h1 class="text-4xl font-bold mb-4">{{ service.name }}</h1>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-bold text-blue-600">{{ service.price_range || 'Liên hệ' }}</span>
            <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">{{ service.category }}</span>
          </div>
        </div>

        <!-- Service Details -->
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4">Mô tả chi tiết</h2>
          <p class="text-gray-700 mb-6">{{ service.description }}</p>

          <div v-if="service.features && service.features.length > 0" class="mb-6">
            <h3 class="font-bold mb-3">Bao gồm:</h3>
            <ul class="list-disc list-inside space-y-2 text-gray-700">
              <li v-for="feature in service.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-bold mb-4">Đánh giá từ khách hàng</h2>
          <div v-if="reviews.length > 0" class="space-y-4">
            <div v-for="review in reviews" :key="review.id" class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold">{{ review.customer_name }}</span>
                <span class="text-yellow-500">★ {{ review.rating }}/5</span>
              </div>
              <p class="text-gray-600">{{ review.comment }}</p>
            </div>
          </div>
          <p v-else class="text-gray-600">Chưa có đánh giá</p>
        </div>

        <!-- CTA Button -->
        <div class="mt-8">
          <router-link
            v-if="authStore.isLoggedIn && authStore.user?.role === 'customer'"
            to="/booking"
            class="w-full btn-primary py-4 text-lg text-center"
          >
            Đặt dịch vụ này
          </router-link>
          <router-link
            v-else
            to="/login"
            class="w-full btn-primary py-4 text-lg text-center"
          >
            Đăng nhập để đặt dịch vụ
          </router-link>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-red-600">Không tìm thấy dịch vụ</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getServiceById } from '@/services/serviceService'
import { getServiceReviews } from '@/services/reviewService'

const route = useRoute()
const authStore = useAuthStore()
const service = ref(null)
const reviews = ref([])
const loading = ref(false)

const fetchService = async () => {
  loading.value = true
  try {
    const res = await getServiceById(route.params.id)
    service.value = res.data
    const reviewRes = await getServiceReviews(route.params.id)
    reviews.value = reviewRes.data
  } catch (err) {
    console.error('Failed to fetch service:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchService)
</script>
