import { useState, useEffect } from 'react'
import { Drawer, Form, Button, Input, SelectPicker, useToaster, Message, Stack } from 'rsuite'
import { createUser, updateUser } from '@/api/usersApi'
import FormField from '@/components/common/FormField'
import { ROLES } from '@/config/constants'

const roleOptions = [
  { label: 'Admin', value: ROLES.ADMIN },
  { label: 'Designer', value: ROLES.DESIGNER },
  { label: 'Customer Support', value: ROLES.CUSTOMER_SUPPORT },
  { label: 'User', value: ROLES.USER },
]

const EMPTY = { name: '', email: '', password: '', role: ROLES.USER }

const UserFormModal = ({ open, onClose, onSuccess, user }) => {
  const toaster = useToaster()
  const [formValue, setFormValue] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  useEffect(() => {
    if (user) setFormValue({ name: user.name || '', email: user.email || '', password: '', role: user.role || ROLES.USER })
    else setFormValue(EMPTY)
  }, [user, open])

  const handleSubmit = async () => {
    if (!formValue.name || !formValue.email) return
    setLoading(true)
    try {
      if (isEdit) {
        const payload = { name: formValue.name, email: formValue.email, role: formValue.role }
        if (formValue.password) payload.password = formValue.password
        await updateUser(user.id, payload)
      } else {
        await createUser(formValue)
      }
      toaster.push(<Message type="success" showIcon closable>{isEdit ? 'User updated' : 'User created'}</Message>, { placement: 'topCenter' })
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed'
      toaster.push(<Message type="error" showIcon closable>{msg}</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} size="sm">
      <Drawer.Header>
        <Drawer.Title>{isEdit ? 'Edit User' : 'Create User'}</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <Form fluid formValue={formValue} onChange={setFormValue}>
          <FormField label="Name" name="name" required>
            <Input name="name" value={formValue.name} onChange={(v) => setFormValue((f) => ({ ...f, name: v }))} />
          </FormField>
          <FormField label="Email" name="email" required>
            <Input name="email" type="email" value={formValue.email} onChange={(v) => setFormValue((f) => ({ ...f, email: v }))} />
          </FormField>
          <FormField label="Password" name="password" required={!isEdit}>
            <Input name="password" type="password" value={formValue.password} onChange={(v) => setFormValue((f) => ({ ...f, password: v }))} placeholder={isEdit ? 'Leave blank to keep current' : ''} />
          </FormField>
          <FormField label="Role" name="role" required>
            <SelectPicker data={roleOptions} value={formValue.role} onChange={(v) => setFormValue((f) => ({ ...f, role: v }))} block />
          </FormField>
        </Form>
      </Drawer.Body>
      <Drawer.Actions>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSubmit} appearance="primary" loading={loading}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </Drawer.Actions>
    </Drawer>
  )
}

export default UserFormModal
