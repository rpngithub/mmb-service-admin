import api from './axiosInstance'

export const getUserDesigns = (params) => api.get('/user-designs', { params })
export const getUserDesignById = (id) => api.get(`/user-designs/${id}`)
export const uploadUserDesign = (formData) =>
  api.post('/user-designs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const updateUserDesign = (id, data) => api.put(`/user-designs/${id}`, data)
export const deleteUserDesign = (id) => api.delete(`/user-designs/${id}`)
export const getUserDesignFile = (id) =>
  api.get(`/user-designs/${id}/file`, { responseType: 'blob' })
