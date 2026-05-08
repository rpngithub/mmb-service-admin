import api from './axiosInstance'

export const getUserBusinesses = (params) => api.get('/user-businesses', { params })
export const getUserBusinessById = (id) => api.get(`/user-businesses/${id}`)
export const createUserBusiness = (data) => api.post('/user-businesses', data)
export const updateUserBusiness = (id, data) => api.put(`/user-businesses/${id}`, data)
export const deleteUserBusiness = (id) => api.delete(`/user-businesses/${id}`)
