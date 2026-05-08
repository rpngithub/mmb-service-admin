import api from './axiosInstance'

export const getDesigns = (params) => api.get('/designs', { params })
export const getDesignById = (id) => api.get(`/designs/${id}`)
export const createDesign = (data) => api.post('/designs', data)
export const updateDesign = (id, data) => api.put(`/designs/${id}`, data)
export const deleteDesign = (id) => api.delete(`/designs/${id}`)
