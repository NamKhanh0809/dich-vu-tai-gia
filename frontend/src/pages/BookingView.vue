<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Đăng ký dịch vụ</h1>
    <form @submit.prevent="submitBooking" class="card space-y-6">
      <div v-if="error" class="bg-red-50 text-red-800 p-3 rounded">{{ error }}</div>
      <div v-if="success" class="bg-green-50 text-green-800 p-3 rounded">{{ success }}</div>

      <div>
        <label class="form-label">Họ và tên</label>
        <input v-model="form.fullName" type="text" required class="input-field" :readonly="!!userFullName" />
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="form-label mb-0">Địa chỉ thực hiện</label>
          <button 
            type="button" 
            @click="isManualAddress = !isManualAddress" 
            class="text-sm text-blue-600 hover:underline"
          >
            {{ isManualAddress ? 'Chọn từ sổ địa chỉ' : 'Tự nhập địa chỉ mới' }}
          </button>
        </div>

        <div v-if="!isManualAddress">
          <select v-model="selectedAddressId" @change="handleAddressSelect" class="input-field">
            <option value="" disabled>-- Chọn địa chỉ đã lưu --</option>
            <option v-for="addr in savedAddresses" :key="addr.id" :value="addr.id">
              [{{ addr.label }}] {{ addr.full_address }}
            </option>
          </select>
          <p v-if="savedAddresses.length === 0" class="text-xs text-red-500 mt-1">
            Bạn chưa có địa chỉ lưu sẵn. Hãy chọn "Tự nhập địa chỉ mới".
          </p>
        </div>

        <div v-else>
          <textarea v-model="form.address" required class="input-field" rows="2" placeholder="Số nhà, đường, phường, quận..."></textarea>
        </div>
      </div>

      <div>
        <label class="form-label font-semibold">Chọn dịch vụ (có thể chọn nhiều)</label>
        <multiselect
          v-model="form.selectedServices"
          :options="services"
          mode="multiple"
          valueProp="id"
          label="name"
          track-by="name"
          :object="true"
          :searchable="true"
          :close-on-select="false"
          placeholder="Tìm và chọn dịch vụ"
        />
        
        <div v-if="form.selectedServices && form.selectedServices.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span 
            v-for="(service, index) in form.selectedServices" 
            :key="service.id"
            class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm border border-blue-200"
          >
            {{ service.name }}
            <button type="button" @click="removeService(index)" class="ml-2 text-blue-500 hover:text-blue-800 font-bold focus:outline-none">
              ×
            </button>
          </span>
        </div>
      </div>

      <div>
        <label class="form-label">Chọn ngày và giờ</label>
        <input v-model="form.scheduled_datetime" type="datetime-local" required class="input-field" />
        <p class="text-xs text-gray-500 mt-1">Khung giờ: 8:00 - 17:30, các ngày trong tuần</p>
      </div>

      <div>
        <label class="form-label">Nội dung yêu cầu</label>
        <textarea v-model="form.note" rows="5" class="input-field" placeholder="Mô tả chi tiết công việc cần làm..."></textarea>
      </div>

      <button type="submit" :disabled="loading" class="w-full btn-primary py-3">
        {{ loading ? 'Đang gửi...' : 'Gửi yêu cầu' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Multiselect from '@vueform/multiselect';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { getAllServices } from '@/services/serviceService';
import { createOrder } from '@/services/orderService';
import apiClient from '@/services/api';
import '@vueform/multiselect/themes/default.css';
import { getAddresses } from '@/services/addressService';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isManualAddress = ref(false);
const savedAddresses = ref([]);
const selectedAddressId = ref('');
const services = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const userFullName = ref('');

const form = ref({
  fullName: '',
  address: '',
  selectedServices: [],
  scheduled_datetime: '',
  note: ''
});

// Kiểm tra đăng nhập
if (!authStore.isAuthenticated) {
  router.push('/login?redirect=/booking');
}

// Hàm bổ sung: Xóa dịch vụ khỏi tags (Sửa lỗi "removeService is not a function")
const removeService = (index) => {
  form.value.selectedServices.splice(index, 1);
};

// Gộp chung onMounted để xử lý tất cả dữ liệu ban đầu
onMounted(async () => {
  try {
    // 1. Lấy thông tin Profile người dùng
    const resProfile = await apiClient.get('/profiles');
    userFullName.value = resProfile.data.full_name || authStore.user?.email;
    form.value.fullName = userFullName.value;

    // 2. Tải danh sách dịch vụ
    const resServices = await getAllServices();
    services.value = resServices.data;

    // 3. Tải sổ địa chỉ
    const resAddresses = await getAddresses();
    savedAddresses.value = resAddresses.data || resAddresses;
    if (savedAddresses.value.length === 0) {
      isManualAddress.value = true;
    }

    // Xử lý nếu đi từ trang chi tiết dịch vụ qua (query param)
    if (route.query.service) {
      const serviceId = parseInt(route.query.service);
      const service = services.value.find(s => s.id === serviceId);
      if (service) {
        form.value.selectedServices = [service];
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu ban đầu:', err);
  }
});

const handleAddressSelect = () => {
  const found = savedAddresses.value.find(a => a.id === selectedAddressId.value);
  if (found) {
    form.value.address = found.full_address;
  }
};

const submitBooking = async () => {
  if (form.value.selectedServices.length === 0) {
    error.value = 'Vui lòng chọn ít nhất một dịch vụ';
    return;
  }
  if (!form.value.address) {
    error.value = 'Vui lòng nhập địa chỉ';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    const serviceIds = form.value.selectedServices.map(s => s.id);
    await createOrder({
      serviceIds,
      scheduled_datetime: form.value.scheduled_datetime,
      address: form.value.address,
      note: form.value.note
    });
    success.value = 'Đặt dịch vụ thành công! Admin sẽ xử lý và thông báo.';
    setTimeout(() => router.push('/my-orders'), 2000);
  } catch (err) {
    error.value = err.response?.data?.message || 'Lỗi đặt dịch vụ';
  } finally {
    loading.value = false;
  }
};
</script>