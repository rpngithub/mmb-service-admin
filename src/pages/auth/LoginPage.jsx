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
      const { data } = await signin(formValue)
      setAuth(data.accessToken)
      const { data: profileData } = await getProfile()
      const user = profileData?.user || profileData
      setUser(user)
      const role = user?.role
      if (role === ROLES.ADMIN) navigate('/dashboard')
      else if (role === ROLES.DESIGNER) navigate('/user-designs')
      else if (role === ROLES.CUSTOMER_SUPPORT) navigate('/support/customers')
      else navigate('/profile')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials'
      toaster.push(<Message type="error" showIcon closable>{msg}</Message>, { placement: 'topCenter' })
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Form fluid formValue={formValue} onChange={setFormValue} onSubmit={() => handleSubmit()}>
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
          <Button type="submit" appearance="primary" loading={loading} style={{ width: '100%' }}>
            Sign In
          </Button>
        </Stack>
      </Form>
    </AuthLayout>
  )
}

export default LoginPage
