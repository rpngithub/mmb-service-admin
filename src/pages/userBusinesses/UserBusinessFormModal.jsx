import { useState, useEffect } from 'react'
import { Drawer, Input, SelectPicker, Button, useToaster, Message, Stack } from 'rsuite'
import FormField from '@/components/common/FormField'
import { createUserBusiness, updateUserBusiness } from '@/api/userBusinessesApi'
import { getUsers } from '@/api/usersApi'
import { getAllBusinesses } from '@/api/businessesApi'

const DELIVERY_OPTIONS = ['Whatsapp', 'Email', 'Drive'].map((v) => ({ label: v, value: v }))
const BRANDING_STATUS_OPTIONS = [
  { label: 'Ready', value: 'READY' },
  { label: 'Only Logo', value: 'ONLY_LOGO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Pending', value: 'PENDING' },
]

const EMPTY = { user_id: '', business_id: '', brand_name: '', city: '', state: '', country: 'India', email: '', phone_number: '', mobile_number: '', delivery_preference: 'Whatsapp', branding_status: 'PENDING' }

const UserBusinessFormModal = ({ open, onClose, onSuccess, userBusiness }) => {
  const toaster = useToaster()
  const [form, setForm] = useState(EMPTY)
  const [users, setUsers] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const isEdit = !!userBusiness

  useEffect(() => {
    if (!open) return
    Promise.all([getUsers(), getAllBusinesses()]).then(([uRes, bRes]) => {
      setUsers((uRes.data?.users || uRes.data || []).map((u) => ({ label: `${u.name} (${u.email})`, value: u.id })))
      setBusinesses((bRes.data?.businesses || bRes.data || []).map((b) => ({ label: b.name, value: b.id })))
    })
  }, [open])

  useEffect(() => {
    if (userBusiness) setForm({ ...EMPTY, ...userBusiness })
    else setForm(EMPTY)
  }, [userBusiness, open])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = async () => {
    if (!form.brand_name) return
    setLoading(true)
    try {
      isEdit ? await updateUserBusiness(userBusiness.id, form) : await createUserBusiness(form)
      toaster.push(<Message type="success" showIcon closable>{isEdit ? 'Updated' : 'Created'}</Message>, { placement: 'topCenter' })
      onSuccess(); onClose()
    } catch (err) {
      toaster.push(<Message type="error" showIcon closable>{err.response?.data?.message || 'Failed'}</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} size="md">
      <Drawer.Header><Drawer.Title>{isEdit ? 'Edit User Business' : 'Create User Business'}</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        {!isEdit && (
          <FormField label="User" name="user_id" required>
            <SelectPicker data={users} value={form.user_id} onChange={set('user_id')} block />
          </FormField>
        )}
        <FormField label="Business Category" name="business_id" required>
          <SelectPicker data={businesses} value={form.business_id} onChange={set('business_id')} block />
        </FormField>
        <FormField label="Brand Name" name="brand_name" required>
          <Input value={form.brand_name} onChange={set('brand_name')} />
        </FormField>
        <Stack spacing={12}>
          <FormField label="City" name="city">
            <Input value={form.city} onChange={set('city')} />
          </FormField>
          <FormField label="State" name="state">
            <Input value={form.state} onChange={set('state')} />
          </FormField>
        </Stack>
        <Stack spacing={12}>
          <FormField label="Email" name="email">
            <Input value={form.email} onChange={set('email')} />
          </FormField>
          <FormField label="Mobile" name="mobile_number">
            <Input value={form.mobile_number} onChange={set('mobile_number')} />
          </FormField>
        </Stack>
        <FormField label="Delivery Preference" name="delivery_preference">
          <SelectPicker data={DELIVERY_OPTIONS} value={form.delivery_preference} onChange={set('delivery_preference')} block cleanable={false} />
        </FormField>
        <FormField label="Branding Status" name="branding_status">
          <SelectPicker data={BRANDING_STATUS_OPTIONS} value={form.branding_status} onChange={set('branding_status')} block cleanable={false} />
        </FormField>
      </Drawer.Body>
      <Drawer.Actions>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSubmit} appearance="primary" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
      </Drawer.Actions>
    </Drawer>
  )
}

export default UserBusinessFormModal
