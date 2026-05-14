import { defineStore } from 'pinia'
import { login, register, getProfile, logout } from '@/services/authService'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAuthenticated: (state) => !!state.token, // Thêm getter này
    userRole: (state) => state.user?.role,
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const res = await login(credentials)
        this.token = res.data.token || res.data.access_token
        this.user = res.data.user
        // Lưu vào localStorage
        localStorage.setItem('access_token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        await this.fetchProfile()

        // Role-based redirect
        if (this.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (this.user.role === 'worker') {
          router.push('/worker/incoming')
        } else {
          router.push('/')
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Đăng nhập thất bại'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(data) {
      this.loading = true
      this.error = null
      try {
        await register(data)
        await this.login({
          identifier: data.email,
          password: data.password,
        })
      } catch (err) {
        this.error = err.response?.data?.message || 'Đăng ký thất bại'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      try {
        const res = await getProfile()
        this.user = { ...this.user, ...res.data }
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    },

    logout() {
      try {
        logout()
      } catch (err) {
        console.error('Logout error:', err)
      }
      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      router.push('/login')
    },

    // Thêm hàm restoreSession để gọi khi App mounted
    restoreSession() {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    },
  },
})