import apiClient from './api'

export const register = (data) => apiClient.post('/auth/register', data)
export const login = (data) => apiClient.post('/auth/login', data)
export const getProfile = () => apiClient.get('/profiles')
export const updateProfile = (data) => apiClient.put('/profiles', data)
export const logout = () => apiClient.post('/auth/logout')
