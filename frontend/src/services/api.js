import axios from 'axios'

const apiClient = axios.create({
  // THAY ĐỔI DÒNG NÀY:
  baseURL: 'https://dich-vu-tai-gia-production.up.railway.app/api', 
  
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: thêm token vào header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: xử lý lỗi 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Chỉ redirect nếu đúng là lỗi auth, không phải lỗi khác
      const isAuthError = err.config.url?.includes('auth/login') || err.config.url?.includes('auth/register')
      if (!isAuthError) {
        localStorage.removeItem('access_token')
        // Chỉ redirect nếu không phải ở trang login
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
