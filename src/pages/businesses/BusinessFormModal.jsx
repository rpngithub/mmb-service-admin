import { useState, useEffect } from 'react'
import { Drawer, Input, Button, useToaster, Message } from 'rsuite'
import FormField from '@/components/common/FormField'
import { createBusiness, updateBusiness } from '@/api/businessesApi'

const EMPTY = { name: '', description: '' }

const BusinessFormModal = ({ open, onClose, onSuccess, business }) => {
  const toaster = useToaster()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const isEdit = !!business

  useEffect(() => {
    setForm(business ? { name: business.name || '', description: business.description || '' } : EMPTY)
  }, [business, open])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = async () => {
    if (!form.name) return
    setLoading(true)
    try {
      isEdit ? await updateBusiness(business.id, form) : await createBusiness(form)
      toaster.push(<Message type="success" showIcon closable>{isEdit ? 'Updated' : 'Created'}</Message>, { placement: 'topCenter' })
      onSuccess(); onClose()
    } catch (err) {
      toaster.push(<Message type="error" showIcon closable>{err.response?.data?.message || 'Failed'}</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} size="sm">
      <Drawer.Header><Drawer.Title>{isEdit ? 'Edit Business' : 'Create Business'}</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        <FormField label="Name" name="name" required>
          <Input value={form.name} onChange={set('name')} />
        </FormField>
        <FormField label="Description" name="description">
          <Input as="textarea" rows={3} value={form.description} onChange={set('description')} />
        </FormField>
      </Drawer.Body>
      <Drawer.Actions>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSubmit} appearance="primary" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
      </Drawer.Actions>
    </Drawer>
  )
}

export default BusinessFormModal
