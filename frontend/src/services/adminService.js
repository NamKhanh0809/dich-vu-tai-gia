import apiClient from './api'

// --- Quản lý đơn hàng ---
export const getPendingOrders = (page = 1) => apiClient.get(`/admin/orders/pending?page=${page}`)
export const approveOrder = (id, data) => apiClient.patch(`/admin/orders/${id}/approve`, data)
export const rejectOrder = (id, data) => apiClient.patch(`/admin/orders/${id}/reject`, data)

// --- Quản lý người dùng ---
export const getUsers = (page = 1) => apiClient.get(`/admin/users?page=${page}`)
export const blockUser = (id) => apiClient.patch(`/admin/users/${id}/lock`, { is_locked: true })
export const unblockUser = (id) => apiClient.patch(`/admin/users/${id}/lock`, { is_locked: false })
export const updateUserLock = (userId, isLocked) => apiClient.patch(`/admin/users/${userId}/lock`, { is_locked: isLocked })

// --- Quản lý thợ ---
export const getWorkerApprovals = (page = 1) => apiClient.get(`/admin/worker-approvals?page=${page}`)
export const approveWorker = (id, data) => apiClient.patch(`/admin/workers/${id}/approve`, data)
export const rejectWorker = (id, data) => apiClient.patch(`/admin/workers/${id}/reject`, data)

// --- Quản lý khiếu nại (CHỈ GIỮ LẠI 1 HÀM) ---
export const getComplaints = () => apiClient.get('/admin/complaints')

// Dùng PUT để khớp với Route Backend adminRoutes.js bạn đã sửa
export const resolveComplaint = (id, data) => {
    return apiClient.put(`/admin/complaints/${id}/resolve`, data);
};

// --- Báo cáo & Thống kê ---
export const getReports = (filter = {}) => apiClient.get('/admin/reports', { params: filter })
export const getAdminStats = () => apiClient.get('/admin/stats')