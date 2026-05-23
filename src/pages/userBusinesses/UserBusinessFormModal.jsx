import { useState, useEffect } from 'react'
import { Drawer, Form, Input, SelectPicker, Button, useToaster, Message } from 'rsuite'
import FormField from '@/components/common/FormField'
import { createUserBusiness, updateUserBusiness } from '@/api/userBusinessesApi'
import { getUsers } from '@/api/usersApi'
import { getAllBusinesses } from '@/api/businessesApi'

const DELIVERY_OPTIONS = ['Whatsapp', 'Email'].map((v) => ({ label: v, value: v }))
const BRANDING_STATUS_OPTIONS = [
  { label: 'Ready', value: 'READY' },
  { label: 'Only Logo', value: 'ONLY_LOGO' },
  { label: 'Need Help', value: 'NEED_HELP' },
]

const OTHER_BIZ_VALUE = -1

const EMPTY = {
  user_id: '',
  business_id: '',
  business_other: '',
  brand_name: '',
  city: '',
  state: '',
  country: 'India',
  email: '',
  phone_number: '',
  mobile_number: '',
  delivery_preference: 'Whatsapp',
  branding_status: 'NEED_HELP',
}

const Row2 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
)
const Row3 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>{children}</div>
)

const UserBusinessFormModal = ({ open, onClose, onSuccess, userBusiness }) => {
  const toaster = useToaster()
  const [form, setForm] = useState(EMPTY)
  const [users, setUsers] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const isEdit = !!userBusiness

  // Derived: business picker data with "Other" appended
  const businessOptions = [...businesses, { label: 'Other', value: OTHER_BIZ_VALUE }]

  useEffect(() => {
    if (!open) return
    Promise.all([getUsers(), getAllBusinesses()]).then(([uRes, bRes]) => {
      setUsers((uRes.data?.users || uRes.data || []).map((u) => ({ label: `${u.name} (${u.email})`, value: u.id })))
      setBusinesses((bRes.data?.businesses || bRes.data || []).map((b) => ({ label: b.name, value: b.id })))
    })
  }, [open])

  useEffect(() => {
    if (userBusiness) {
      // If business_id is null but business_other exists → pre-select "Other"
      const bizId =
        userBusiness.business_id != null
          ? userBusiness.business_id
          : userBusiness.business_other
          ? OTHER_BIZ_VALUE
          : ''
      setForm({
        user_id: userBusiness.user_id ?? '',
        business_id: bizId,
        business_other: userBusiness.business_other || '',
        brand_name: userBusiness.brand_name || '',
        city: userBusiness.city || '',
        state: userBusiness.state || '',
        country: userBusiness.country || 'India',
        email: userBusiness.email || '',
        phone_number: userBusiness.phone_number || '',
        mobile_number: userBusiness.mobile_number || '',
        delivery_preference: userBusiness.delivery_preference || 'Whatsapp',
        branding_status: userBusiness.branding_status || 'NEED_HELP',
      })
    } else {
      setForm(EMPTY)
    }
  }, [userBusiness, open])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleBizChange = (v) => {
    setForm((f) => ({
      ...f,
      business_id: v,
      // Clear free-text when switching away from Other
      business_other: v !== OTHER_BIZ_VALUE ? '' : f.business_other,
    }))
  }

  const handleSubmit = async () => {
    if (!form.brand_name) return
    setLoading(true)
    try {
      const isOther = form.business_id === OTHER_BIZ_VALUE
      const payload = {
        ...form,
        business_id: isOther ? null : form.business_id || null,
        business_other: isOther ? form.business_other || null : null,
      }
      isEdit
        ? await updateUserBusiness(userBusiness.id, payload)
        : await createUserBusiness(payload)
      toaster.push(
        <Message type="success" showIcon closable>{isEdit ? 'Updated' : 'Created'}</Message>,
        { placement: 'topCenter' }
      )
      onSuccess()
      onClose()
    } catch (err) {
      toaster.push(
        <Message type="error" showIcon closable>{err.response?.data?.message || 'Failed'}</Message>,
        { placement: 'topCenter' }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} size="md">
      <Drawer.Header>
        <Drawer.Title>{isEdit ? 'Edit User Business' : 'Create User Business'}</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
      <Form layout="vertical" fluid onSubmit={(_, e) => e?.preventDefault()}>

        {/* ── Identity ─────────────────────────────── */}
        {isEdit ? (
          /* Edit: only business category, full width */
          <FormField label="Business Category" name="business_id">
            <SelectPicker data={businessOptions} value={form.business_id} onChange={handleBizChange} block />
          </FormField>
        ) : (
          /* Create: user + business category side by side */
          <Row2>
            <FormField label="User" name="user_id" required>
              <SelectPicker data={users} value={form.user_id} onChange={set('user_id')} block />
            </FormField>
            <FormField label="Business Category" name="business_id">
              <SelectPicker data={businessOptions} value={form.business_id} onChange={handleBizChange} block />
            </FormField>
          </Row2>
        )}

        {form.business_id === OTHER_BIZ_VALUE && (
          <FormField label="Specify Category" name="business_other" required>
            <Input
              value={form.business_other}
              onChange={set('business_other')}
              placeholder="e.g. Photography Studio"
            />
          </FormField>
        )}

        <FormField label="Brand Name" name="brand_name" required>
          <Input value={form.brand_name} onChange={set('brand_name')} />
        </FormField>

        {/* ── Location ─────────────────────────────── */}
        <Row3>
          <FormField label="City" name="city">
            <Input value={form.city} onChange={set('city')} />
          </FormField>
          <FormField label="State" name="state">
            <Input value={form.state} onChange={set('state')} />
          </FormField>
          <FormField label="Country" name="country">
            <Input value={form.country} onChange={set('country')} />
          </FormField>
        </Row3>

        {/* ── Contact ──────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormField label="Email" name="email">
              <Input value={form.email} onChange={set('email')} type="email" />
            </FormField>
          </div>
          <div style={{ width: 180 }}>
            <FormField label="Mobile" name="mobile_number">
              <Input value={form.mobile_number} onChange={set('mobile_number')} />
            </FormField>
          </div>
        </div>

        {/* ── Settings ─────────────────────────────── */}
        <Row2>
          <FormField label="Delivery Preference" name="delivery_preference">
            <SelectPicker
              data={DELIVERY_OPTIONS}
              value={form.delivery_preference}
              onChange={set('delivery_preference')}
              block
              cleanable={false}
            />
          </FormField>
          <FormField label="Branding Status" name="branding_status">
            <SelectPicker
              data={BRANDING_STATUS_OPTIONS}
              value={form.branding_status}
              onChange={set('branding_status')}
              block
              cleanable={false}
            />
          </FormField>
        </Row2>

        {/* ── Footer ───────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e5ea',
          position: 'sticky', bottom: 0, background: '#fff',
        }}>
          <Button onClick={onClose} appearance="subtle">Cancel</Button>
          <Button onClick={handleSubmit} appearance="primary" loading={loading}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>

      </Form>
      </Drawer.Body>
    </Drawer>
  )
}

export default UserBusinessFormModal
