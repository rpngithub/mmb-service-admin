import axios from 'axios'
import { BASE_URL } from '@/config/constants'
import { getAccessToken } from '@/utils/tokenUtils'
import useAuthStore from '@/store/authStore'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

let isRefreshing = false
let pendingQueue = []

const processPendingQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  pendingQueue = []
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    // Only intercept 401/403 for token refresh; skip retries
    if ((status !== 401 && status !== 403) || original._retry) {
      return Promise.reject(error)
    }

    // If the refresh endpoint itself returned 401/403, session is dead
    if (original.url?.includes('/auth/refresh')) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Queue concurrent requests while a refresh is in flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      // Use plain axios (not `api`) to avoid triggering this interceptor again
      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true })
      const newToken = data.accessToken

      // Restore token + isAuthenticated in the Zustand store
      useAuthStore.getState().setAuth(newToken)

      // Refresh only returns a token — re-fetch profile to restore user in the store
      try {
        const { data: profileData } = await axios.get(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${newToken}` },
        })
        const user = profileData?.user || profileData
        useAuthStore.getState().setUser(user)
      } catch {
        // Profile fetch failed but the token is valid.
        // The original request will still be retried; user stays as-is in store.
      }

      processPendingQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (err) {
      processPendingQueue(err, null)
      // Clears both localStorage tokens AND resets Zustand auth state
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
