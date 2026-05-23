import api from './axiosInstance'

export const getInquiries = (params) => api.get('/inquiries', { params })
export const updateInquiryStatus = (id, status) => api.patch(`/inquiries/${id}/status`, { status })
