import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from 'rsuite'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '@/layouts/AdminLayout'
import { ROUTES, LoginPage, NotAuthorizedPage } from './routes'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/config/constants'

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Loader size="lg" content="Loading..." />
  </div>
)

const DefaultRedirect = () => {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const role = user?.role
  if (role === ROLES.ADMIN) return <Navigate to="/dashboard" replace />
  if (role === ROLES.DESIGNER) return <Navigate to="/user-designs" replace />
  if (role === ROLES.CUSTOMER_SUPPORT) return <Navigate to="/support/customers" replace />
  return <Navigate to="/profile" replace />
}

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<NotAuthorizedPage />} />

        <Route element={<AdminLayout />}>
          {ROUTES.map(({ path, component: Component, roles }) => (
            <Route
              key={path}
              element={<ProtectedRoute roles={roles} />}
            >
              <Route path={path} element={<Component />} />
            </Route>
          ))}
        </Route>

        <Route path="/" element={<DefaultRedirect />} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
