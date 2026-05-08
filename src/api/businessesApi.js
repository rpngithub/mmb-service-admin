import api from './axiosInstance'

export const getActiveBusinesses = () => api.get('/businesses')
export const getAllBusinesses = () => api.get('/businesses/all')
export const getBusinessById = (id) => api.get(`/businesses/${id}`)
export const createBusiness = (data) => api.post('/businesses', data)
export const updateBusiness = (id, data) => api.put(`/businesses/${id}`, data)
export const deleteBusiness = (id) => api.delete(`/businesses/${id}`)
