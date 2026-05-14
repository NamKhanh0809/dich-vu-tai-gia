<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">Bảng giá dịch vụ</h1>
    <div class="mb-6 flex flex-wrap gap-4">
      <input v-model="searchTerm" type="text" placeholder="Tìm dịch vụ..." class="input-field flex-1" />
      <button @click="searchTerm = ''" class="btn-secondary">Xóa</button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-4 border">Dịch vụ</th>
            <th class="py-2 px-4 border">Mô tả</th>
            <th class="py-2 px-4 border">Giá (VNĐ)</th>
            <th class="py-2 px-4 border">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sv in filteredServices" :key="sv.id" class="hover:bg-gray-50">
            <td class="py-2 px-4 border">{{ sv.name }}</td>
            <td class="py-2 px-4 border">{{ sv.description }}</td>
            <td class="py-2 px-4 border">{{ sv.price_range }}</td>
            <td class="py-2 px-4 border">
              <router-link :to="`/booking?service=${sv.id}`" class="text-blue-600 hover:underline">Đặt</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="filteredServices.length === 0" class="text-center py-8 text-gray-500">Không tìm thấy dịch vụ.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllServices } from '@/services/serviceService';

const services = ref([]);
const searchTerm = ref('');

const filteredServices = computed(() => {
  if (!searchTerm.value) return services.value;
  return services.value.filter(s => s.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

onMounted(async () => {
  const res = await getAllServices();
  services.value = res.data;
});
</script>