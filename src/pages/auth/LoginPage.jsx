import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Message, useToaster, Stack } from 'rsuite'
import AuthLayout from '@/layouts/AuthLayout'
import { signin } from '@/api/authApi'
import { getProfile } from '@/api/profileApi'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/config/constants'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth, setUser } = useAuth()
  const toaster = useToaster()
  const [formValue, setFormValue] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formValue.email || !formValue.password) return
    setLoading(true)
    try {
      const { data } = await signin(formValue);
      console.log('Login response:', data) // Debug log
      setAuth(data.accessToken)
      const {data:profileData} = await getProfile();
      console.log('Profile response:', profileData) // Debug log
      const user = profileData?.user || profileData;
      console.log('User data:', user) // Debug log
      setUser(user)
      const role = user?.role;
      console.log('User role:', role) // Debug log
      if (role === ROLES.ADMIN) navigate('/dashboard')
      else if (role === ROLES.DESIGNER) navigate('/user-designs')
      else if (role === ROLES.CUSTOMER_SUPPORT) navigate('/support/customers')
      else navigate('/profile')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials'
      toaster.push(<Message type="error" showIcon closable>{msg}</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Form fluid formValue={formValue} onChange={setFormValue}>
        <h4 style={{ marginBottom: 20 }}>Sign in</h4>
        <Form.Group controlId="email">
          <Form.ControlLabel>Email address</Form.ControlLabel>
          <Form.Control name="email" type="email" placeholder="admin@example.com" autoComplete="email" />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.ControlLabel>Password</Form.ControlLabel>
          <Form.Control name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
        </Form.Group>
        <Stack justifyContent="flex-end" style={{ marginTop: 8 }}>
          <Button appearance="primary" loading={loading} onClick={handleSubmit} style={{ width: '100%' }}>
            Sign In
          </Button>
        </Stack>
      </Form>
    </AuthLayout>
  )
}

export default LoginPage
