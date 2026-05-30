import api from './axiosInstance'

export const getSubscriptions = (params) => api.get('/subscriptions', { params })
export const getSubscriptionById = (id) => api.get(`/subscriptions/${id}`)
export const createSubscription = (data) => api.post('/subscriptions', data)
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data)
export const deleteSubscription = (id) => api.delete(`/subscriptions/${id}`)
export const startFreeTrial = () => api.post('/subscriptions/free-trial')
export const getFreeTrials = (params) => api.get('/subscriptions/free-trials')
export const getFreeTrialById = (id) => api.get(`/subscriptions/free-trials/${id}`)
export const checkout = (planId) => api.post('/subscriptions/checkout', { plan_id: planId })
export const verifyPayment = (data) => api.post('/subscriptions/verify-payment', data)
