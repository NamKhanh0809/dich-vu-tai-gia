import apiClient from './api'

export const createReview = (orderId, data) => apiClient.post(`/orders/${orderId}/reviews`, data)
export const getReviews = (page = 1) => apiClient.get(`/reviews?page=${page}`)
export const getServiceReviews = (serviceId, page = 1) => apiClient.get(`/services/${serviceId}/reviews?page=${page}`)
export const getWorkerReviews = (workerId, page = 1) => apiClient.get(`/workers/${workerId}/reviews?page=${page}`)
export const updateReview = (id, data) => apiClient.put(`/reviews/${id}`, data)
export const deleteReview = (id) => apiClient.delete(`/reviews/${id}`)
