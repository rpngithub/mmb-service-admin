import api from './axiosInstance'

export const getProfile = () => api.get('/profile')
export const updateProfile = (formData) =>
  api.put('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const updateMobile = (data) => api.put('/profile/mobile', data)
export const deleteAsset = (assetId) => api.delete(`/profile/assets/${assetId}`)
