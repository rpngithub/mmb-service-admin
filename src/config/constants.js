export const ROLES = {
  ADMIN: 'ADMIN',
  DESIGNER: 'DESIGNER',
  CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT',
  USER: 'USER',
}

export const TOKEN_KEYS = {
  ACCESS: 'mmb_access_token',
  REFRESH: 'mmb_refresh_token',
}

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
