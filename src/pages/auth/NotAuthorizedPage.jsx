import { useNavigate } from 'react-router-dom'
import { Button, Stack } from 'rsuite'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/config/constants'

const NotAuthorizedPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const goHome = () => {
    const role = user?.role
    if (role === ROLES.ADMIN) navigate('/dashboard')
    else if (role === ROLES.DESIGNER) navigate('/user-designs')
    else if (role === ROLES.CUSTOMER_SUPPORT) navigate('/support/customers')
    else navigate('/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f8fc',
      }}
    >
      <Stack direction="column" alignItems="center" spacing={16}>
        <div style={{ fontSize: 64 }}>🚫</div>
        <h2 style={{ margin: 0, color: '#1a1f36' }}>Access Denied</h2>
        <p style={{ margin: 0, color: '#6b7280', textAlign: 'center', maxWidth: 320 }}>
          You don't have permission to view this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Button appearance="primary" onClick={goHome}>
          Go to My Home
        </Button>
      </Stack>
    </div>
  )
}

export default NotAuthorizedPage
