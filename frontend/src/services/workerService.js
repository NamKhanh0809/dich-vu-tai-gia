import apiClient from './api'

export const registerAsWorker = (data) => apiClient.post('/profiles/worker', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getWorkerProfile = (id) => apiClient.get(`/workers/${id}`)
export const getAvailableWorkers = (params) => apiClient.get('/admin/workers/available', { params })
export const getWorkerStats = () => apiClient.get('/worker/stats')
export const updateWorkerStatus = (status) => apiClient.patch('/worker/status', { status })
export const getWorkerAvailability = () => apiClient.get('/worker/availability')
export const setWorkerAvailability = (data) => apiClient.post('/worker/availability', data)
