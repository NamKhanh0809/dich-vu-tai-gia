import apiClient from './api'

export const getAllServices = (page = 1) => apiClient.get(`/services?page=${page}`)
export const getServiceById = (id) => apiClient.get(`/services/${id}`)
export const searchServices = (query) => apiClient.get(`/services/search?q=${query}`)
export const getServicesByCategory = (category) => apiClient.get(`/services?category=${category}`)

// CÁC HÀM MỚI CHO ADMIN QUẢN LÝ DỊCH VỤ
// Giả định endpoint cho admin là '/admin/services'. Nếu file adminRoutes.js của bạn được gán vào '/api/services', hãy sửa chữ '/admin' thành cấu hình của bạn.
export const createService = (data) => apiClient.post('/admin/services', data)
export const deleteServiceApi = (id) => apiClient.delete(`/admin/services/${id}`)

export const uploadServicesCSV = (file) => {
  const formData = new FormData();
  
  // Gắn file vào hộp FormData với nhãn 'file' (khớp với backend)
  formData.append('file', file);

  // Truyền trực tiếp formData, ép Content-Type để apiClient không biến nó thành JSON
  return apiClient.post('/admin/services/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};