import api from './axiosInstance'

export const signin = (data) => api.post('/auth/signin', data)
export const signinMobile = (data) => api.post('/auth/signin-mobile', data)
export const signup = (data) => api.post('/auth/signup', data)
export const refresh = (refreshToken) => api.post('/auth/refresh', { refreshToken })
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken })
