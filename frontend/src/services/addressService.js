import apiClient from './api'

// Chỉ giữ lại các hàm liên quan đến Địa chỉ (Address)
export const getAddresses = () => apiClient.get('/addresses')
export const createAddress = (data) => apiClient.post('/addresses', data)
export const updateAddress = (id, data) => apiClient.put(`/addresses/${id}`, data)
export const deleteAddress = (id) => apiClient.delete(`/addresses/${id}`)
export const setDefaultAddress = (id) => apiClient.patch(`/addresses/${id}/default`, {})