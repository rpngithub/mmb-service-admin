import { TOKEN_KEYS } from '@/config/constants'

export const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS)
export const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.REFRESH)

export const setTokens = (accessToken) => {
  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
  // if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS)
  localStorage.removeItem(TOKEN_KEYS.REFRESH)
}
