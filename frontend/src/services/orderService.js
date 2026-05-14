import apiClient from './api'

export const createOrder = (data) => apiClient.post('/orders', data)
export const getMyOrders = (page = 1) => apiClient.get(`/orders?page=${page}`)
export const getOrderDetail = (id) => apiClient.get(`/orders/${id}`)
export const cancelOrder = (id) => apiClient.patch(`/orders/${id}/cancel`, {})
export const getWorkerOrders = (page = 1) => apiClient.get(`/worker/orders?page=${page}`)
export const updateOrderStatus = (id, status) => apiClient.patch(`/worker/orders/${id}/status`, { status })
export const getWorkHistory = (page = 1) => apiClient.get(`/worker/history?page=${page}`)
export const completeOrder = (id, data) => apiClient.patch(`/orders/${id}/complete`, data)
