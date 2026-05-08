import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
