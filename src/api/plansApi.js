import api from './axiosInstance'

export const getActivePlans = () => api.get('/plans')
export const getAllPlans = () => api.get('/plans/all')
export const getPlanById = (id) => api.get(`/plans/${id}`)
export const createPlan = (data) => api.post('/plans', data)
export const updatePlan = (id, data) => api.put(`/plans/${id}`, data)
export const deletePlan = (id) => api.delete(`/plans/${id}`)
