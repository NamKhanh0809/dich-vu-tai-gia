<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Báo cáo sự cố / Khiếu nại</h1>
    <form @submit.prevent="submitComplaint" class="card space-y-6">
      <div v-if="error" class="bg-red-50 text-red-800 p-3 rounded">{{ error }}</div>
      <div v-if="success" class="bg-green-50 text-green-800 p-3 rounded">{{ success }}</div>

      <div>
        <label class="form-label">Tiêu đề</label>
        <input v-model="subject" type="text" required class="input-field" placeholder="Ví dụ: Thợ đến trễ, chất lượng không tốt..." />
      </div>

      <div>
        <label class="form-label">Mô tả sự cố</label>
        <textarea v-model="description" rows="6" required class="input-field" placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."></textarea>
      </div>

      <div>
        <label class="form-label">Mã đơn hàng (nếu có)</label>
        <input v-model="orderId" type="number" class="input-field" placeholder="Nhập mã đơn hàng liên quan" />
      </div>

      <button type="submit" :disabled="loading" class="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700">
        {{ loading ? 'Đang gửi...' : 'Gửi báo cáo' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const router = useRouter();
const subject = ref('');
const description = ref('');
const orderId = ref(null);
const loading = ref(false);
const error = ref('');
const success = ref('');

// Bắt buộc đăng nhập
if (!authStore.isAuthenticated) router.push('/login?redirect=/complaint');

const submitComplaint = async () => {
  if (!subject.value || !description.value) {
    error.value = 'Vui lòng nhập đầy đủ tiêu đề và mô tả';
    return;
  }
  
  loading.value = true;
  error.value = '';
  success.value = '';
  
  try {
    // SỬA LẠI ĐOẠN NÀY ĐỂ KHỚP VỚI BACKEND
    await apiClient.post('/complaints', {
      orderId: orderId.value || null, // Sửa từ order_id thành orderId
      subject: subject.value,
      description: description.value,
      userId: authStore.user?.id // Thêm dòng này để gửi ID người dùng xuống database
    });
    
    success.value = 'Báo cáo đã được gửi. Admin sẽ xử lý sớm!';
    subject.value = '';
    description.value = '';
    orderId.value = null;
  } catch (err) {
    error.value = err.response?.data?.message || 'Lỗi gửi báo cáo';
  } finally {
    loading.value = false;
  }
};
</script>