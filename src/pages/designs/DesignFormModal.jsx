import { useState, useEffect } from 'react'
import { Drawer, Input, SelectPicker, Button, useToaster, Message } from 'rsuite'
import FormField from '@/components/common/FormField'
import { createDesign, updateDesign } from '@/api/designsApi'

const VISIBILITY_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Subscription Based', value: 'subscription-based' },
]

const EMPTY = { title: '', description: '', file_url: '', visibility: 'public' }

const DesignFormModal = ({ open, onClose, onSuccess, design }) => {
  const toaster = useToaster()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const isEdit = !!design

  useEffect(() => {
    setForm(design ? { title: design.title || '', description: design.description || '', file_url: design.file_url || '', visibility: design.visibility || 'public' } : EMPTY)
  }, [design, open])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = async () => {
    if (!form.title) return
    setLoading(true)
    try {
      isEdit ? await updateDesign(design.id, form) : await createDesign(form)
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
      <Drawer.Header><Drawer.Title>{isEdit ? 'Edit Design' : 'Create Design'}</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        <FormField label="Title" name="title" required>
          <Input value={form.title} onChange={set('title')} />
        </FormField>
        <FormField label="Description" name="description">
          <Input as="textarea" rows={3} value={form.description} onChange={set('description')} />
        </FormField>
        <FormField label="File URL" name="file_url">
          <Input value={form.file_url} onChange={set('file_url')} placeholder="https://cdn.example.com/..." />
        </FormField>
        <FormField label="Visibility" name="visibility" required>
          <SelectPicker data={VISIBILITY_OPTIONS} value={form.visibility} onChange={set('visibility')} block cleanable={false} />
        </FormField>
      </Drawer.Body>
      <Drawer.Actions>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSubmit} appearance="primary" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
      </Drawer.Actions>
    </Drawer>
  )
}

export default DesignFormModal
