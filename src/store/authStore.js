import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setTokens as persistTokens, clearTokens } from '@/utils/tokenUtils'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Called on login AND after a silent token refresh
      setAuth: (accessToken) => {
        persistTokens(accessToken)
        set({ accessToken, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearTokens()
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'mmb_auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
