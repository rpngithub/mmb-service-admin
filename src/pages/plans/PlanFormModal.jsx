import { useState, useEffect } from 'react'
import { Drawer, Input, InputNumber, Toggle, TagInput, SelectPicker, Button, useToaster, Message, Stack } from 'rsuite'
import FormField from '@/components/common/FormField'
import { createPlan, updatePlan } from '@/api/plansApi'

const UNITS = [
  { label: 'Day', value: 'DAY' },
  { label: 'Month', value: 'MONTH' },
  { label: 'Year', value: 'YEAR' },
]

const EMPTY = { name: '', description: '', original_price: '', price: '', duration: 1, duration_unit: 'MONTH', features: [], popular: false }

const PlanFormModal = ({ open, onClose, onSuccess, plan }) => {
  const toaster = useToaster()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const isEdit = !!plan

  useEffect(() => {
    if (plan) setForm({ ...EMPTY, ...plan, features: plan.features || [] })
    else setForm(EMPTY)
  }, [plan, open])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.price) return
    setLoading(true)
    try {
      const payload = { ...form, price: Number(form.price), original_price: Number(form.original_price), duration: Number(form.duration) }
      isEdit ? await updatePlan(plan.id, payload) : await createPlan(payload)
      toaster.push(<Message type="success" showIcon closable>{isEdit ? 'Plan updated' : 'Plan created'}</Message>, { placement: 'topCenter' })
      onSuccess()
      onClose()
    } catch (err) {
      toaster.push(<Message type="error" showIcon closable>{err.response?.data?.message || 'Failed'}</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} size="sm">
      <Drawer.Header><Drawer.Title>{isEdit ? 'Edit Plan' : 'Create Plan'}</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        <FormField label="Name" name="name" required>
          <Input value={form.name} onChange={set('name')} />
        </FormField>
        <FormField label="Description" name="description">
          <Input as="textarea" rows={3} value={form.description} onChange={set('description')} />
        </FormField>
        <Stack spacing={12}>
          <FormField label="Original Price (₹)" name="original_price">
            <InputNumber value={form.original_price} onChange={set('original_price')} min={0} style={{ width: '100%' }} />
          </FormField>
          <FormField label="Sale Price (₹)" name="price" required>
            <InputNumber value={form.price} onChange={set('price')} min={0} style={{ width: '100%' }} />
          </FormField>
        </Stack>
        <Stack spacing={12}>
          <FormField label="Duration" name="duration" required>
            <InputNumber value={form.duration} onChange={set('duration')} min={1} style={{ width: '100%' }} />
          </FormField>
          <FormField label="Unit" name="duration_unit" required>
            <SelectPicker data={UNITS} value={form.duration_unit} onChange={set('duration_unit')} block cleanable={false} />
          </FormField>
        </Stack>
        <FormField label="Features" name="features">
          <TagInput value={form.features} onChange={set('features')} trigger={['Enter', 'Space']} block />
        </FormField>
        <FormField label="Mark as Popular" name="popular">
          <Toggle checked={form.popular} onChange={set('popular')} />
        </FormField>
      </Drawer.Body>
      <Drawer.Actions>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSubmit} appearance="primary" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
      </Drawer.Actions>
    </Drawer>
  )
}

export default PlanFormModal
