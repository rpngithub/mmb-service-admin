import useAuthStore from '@/store/authStore'
import { hasRole, hasAnyRole } from '@/utils/roleUtils'
import { ROLES } from '@/config/constants'

const useAuth = () => {
  const { user, accessToken, isAuthenticated, setAuth, setUser, logout } = useAuthStore()

  return {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    setUser,
    logout,
    isAdmin: hasRole(user, ROLES.ADMIN),
    isDesigner: hasRole(user, ROLES.DESIGNER),
    isSupport: hasRole(user, ROLES.CUSTOMER_SUPPORT),
    can: (roles) => hasAnyRole(user, roles),
  }
}

export default useAuth
