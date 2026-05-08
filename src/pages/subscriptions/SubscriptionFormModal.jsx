import { useState, useEffect } from 'react'
import { Drawer, Input, SelectPicker, DatePicker, Button, useToaster, Message, Stack } from 'rsuite'
import FormField from '@/components/common/FormField'
import { createSubscription, updateSubscription } from '@/api/subscriptionsApi'
import { getAllPlans } from '@/api/plansApi'
import { getUsers } from '@/api/usersApi'
import { parseISO } from 'date-fns'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Expired', value: 'expired' },
  { label: 'Free Trial', value: 'free_trial' },
]

const EMPTY = { user_id: '', plan_id: '', start_date: null, end_date: null, status: 'active' }

const SubscriptionFormModal = ({ open, onClose, onSuccess, subscription }) => {
  const toaster = useToaster()
  const [form, setForm] = useState(EMPTY)
  const [plans, setPlans] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const isEdit = !!subscription

  useEffect(() => {
    if (!open) return
    Promise.all([getAllPlans(), getUsers()]).then(([pRes, uRes]) => {
      setPlans((pRes.data?.plans || pRes.data || []).map((p) => ({ label: p.name, value: p.id })))
      setUsers((uRes.data?.users || uRes.data || []).map((u) => ({ label: `${u.name} (${u.email})`, value: u.id })))
    })
  }, [open])

  useEffect(() => {
    if (subscription) {
      setForm({
        user_id: subscription.user_id || subscription.user?.id || '',
        plan_id: subscription.plan_id || subscription.plan?.id || '',
        start_date: subscription.start_date ? parseISO(subscription.start_date) : null,
        end_date: subscription.end_date ? parseISO(subscription.end_date) : null,
        status: subscription.status || 'active',
      })
    } else setForm(EMPTY)
  }, [subscription, open])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        start_date: form.start_date?.toISOString().split('T')[0],
        end_date: form.end_date?.toISOString().split('T')[0],
      }
      isEdit ? await updateSubscription(subscription.id, payload) : await createSubscription(payload)
      toaster.push(<Message type="success" showIcon closable>{isEdit ? 'Subscription updated' : 'Subscription created'}</Message>, { placement: 'topCenter' })
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
      <Drawer.Header><Drawer.Title>{isEdit ? 'Edit Subscription' : 'Create Subscription'}</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        {!isEdit && (
          <FormField label="User" name="user_id" required>
            <SelectPicker data={users} value={form.user_id} onChange={set('user_id')} block />
          </FormField>
        )}
        <FormField label="Plan" name="plan_id" required>
          <SelectPicker data={plans} value={form.plan_id} onChange={set('plan_id')} block />
        </FormField>
        <FormField label="Status" name="status" required>
          <SelectPicker data={STATUS_OPTIONS} value={form.status} onChange={set('status')} block cleanable={false} />
        </FormField>
        <Stack spacing={12}>
          <FormField label="Start Date" name="start_date">
            <DatePicker value={form.start_date} onChange={set('start_date')} block oneTap />
          </FormField>
          <FormField label="End Date" name="end_date">
            <DatePicker value={form.end_date} onChange={set('end_date')} block oneTap />
          </FormField>
        </Stack>
      </Drawer.Body>
      <Drawer.Actions>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSubmit} appearance="primary" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
      </Drawer.Actions>
    </Drawer>
  )
}

export default SubscriptionFormModal
