import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Steps, Panel, Button, SelectPicker, RadioGroup, Radio,
  Message, Stack, Input, Uploader, useToaster, Loader
} from 'rsuite'
import PageHeader from '@/components/common/PageHeader'
import { getUsers } from '@/api/usersApi'
import { getUserBusinesses } from '@/api/userBusinessesApi'
import { getSubscriptions } from '@/api/subscriptionsApi'
import { uploadUserDesign } from '@/api/userDesignsApi'
import { ROLES } from '@/config/constants'
import { useEffect } from 'react'

const TOTAL_STEPS = 4

const UploadUserDesignPage = () => {
  const navigate = useNavigate()
  const toaster = useToaster()
  const [step, setStep] = useState(0)
  const [ctx, setCtx] = useState({ userId: null, userName: '', userBusinessId: null, brandName: '', subscription: null })

  // Step 1 state
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Step 2 state
  const [businesses, setBusinesses] = useState([])
  const [bizLoading, setBizLoading] = useState(false)
  const [selectedBizId, setSelectedBizId] = useState(null)

  // Step 3 state
  const [subLoading, setSubLoading] = useState(false)
  const [activeSub, setActiveSub] = useState(null)
  const [subChecked, setSubChecked] = useState(false)

  // Step 4 state
  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)

  // Load users on mount
  useEffect(() => {
    setUsersLoading(true)
    getUsers()
      .then(({ data }) => {
        const all = data?.users || data || []
        const customers = all.filter((u) => u.role === ROLES.USER)
        setUsers(customers.map((u) => ({ label: `${u.name} – ${u.email}`, value: u.id, name: u.name })))
      })
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }, [])

  // Load businesses when user selected and on step 2
  useEffect(() => {
    if (step !== 1 || !ctx.userId) return
    setBizLoading(true)
    getUserBusinesses({ user_id: ctx.userId })
      .then(({ data }) => setBusinesses(data?.userBusinesses || data || []))
      .catch(() => {})
      .finally(() => setBizLoading(false))
  }, [step, ctx.userId])

  // Check subscription when on step 3
  useEffect(() => {
    if (step !== 2 || !ctx.userBusinessId) return
    setSubLoading(true)
    setSubChecked(false)
    getSubscriptions({ user_business_id: ctx.userBusinessId })
      .then(({ data }) => {
        const subs = data?.subscriptions || data || []
        const found = subs.find((s) => s.status === 'active' || s.status === 'free_trial')
        setActiveSub(found || null)
        setSubChecked(true)
      })
      .catch(() => { setActiveSub(null); setSubChecked(true) })
      .finally(() => setSubLoading(false))
  }, [step, ctx.userBusinessId])

  const goNext = () => setStep((s) => s + 1)
  const goBack = () => setStep((s) => s - 1)

  const handleSelectUser = (userId) => {
    const user = users.find((u) => u.value === userId)
    setCtx((c) => ({ ...c, userId, userName: user?.name || '' }))
    setSelectedBizId(null)
  }

  const handleSelectBusiness = (bizId) => {
    setSelectedBizId(bizId)
    const biz = businesses.find((b) => b.id === bizId)
    setCtx((c) => ({ ...c, userBusinessId: bizId, brandName: biz?.brand_name || '' }))
  }

  const handleUpload = async () => {
    if (!fileList.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('user_business_id', ctx.userBusinessId)
      formData.append('description', description)
      formData.append('visibility', 'private')
      fileList.forEach((f) => formData.append('files', f.blobFile))
      await uploadUserDesign(formData)
      toaster.push(<Message type="success" showIcon closable>Design uploaded successfully!</Message>, { placement: 'topCenter' })
      navigate('/user-designs')
    } catch (err) {
      toaster.push(<Message type="error" showIcon closable>{err.response?.data?.message || 'Upload failed'}</Message>, { placement: 'topCenter' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Upload User Design" subtitle="Follow the steps to upload a design for a customer" />

      <Panel bordered style={{ background: '#fff', marginBottom: 24 }}>
        <Steps current={step} style={{ marginBottom: 32 }}>
          <Steps.Item title="Select User" />
          <Steps.Item title="Select Business" />
          <Steps.Item title="Verify Subscription" />
          <Steps.Item title="Upload Design" />
        </Steps>

        {/* Step 1 — Select User */}
        {step === 0 && (
          <div>
            <h5 style={{ marginBottom: 16 }}>Select a customer to upload designs for</h5>
            {usersLoading ? (
              <Loader content="Loading users..." />
            ) : (
              <SelectPicker
                data={users}
                value={ctx.userId}
                onChange={handleSelectUser}
                placeholder="Search and select a user..."
                block
                style={{ maxWidth: 420 }}
              />
            )}
            <Stack justifyContent="flex-end" style={{ marginTop: 24 }}>
              <Button appearance="primary" onClick={goNext} disabled={!ctx.userId}>
                Next: Select Business
              </Button>
            </Stack>
          </div>
        )}

        {/* Step 2 — Select User Business */}
        {step === 1 && (
          <div>
            <h5 style={{ marginBottom: 8 }}>
              Select the business for <strong>{ctx.userName}</strong>
            </h5>
            {bizLoading ? (
              <Loader content="Loading businesses..." />
            ) : businesses.length === 0 ? (
              <Message type="warning" showIcon>This user has no registered businesses.</Message>
            ) : (
              <RadioGroup name="business" value={selectedBizId} onChange={handleSelectBusiness}>
                {businesses.map((b) => (
                  <Radio key={b.id} value={b.id} style={{ display: 'block', marginBottom: 8 }}>
                    <strong>{b.brand_name}</strong>
                    {b.city && <span style={{ color: '#8e8e93', marginLeft: 8, fontSize: 13 }}>{b.city}</span>}
                  </Radio>
                ))}
              </RadioGroup>
            )}
            <Stack justifyContent="space-between" style={{ marginTop: 24 }}>
              <Button appearance="subtle" onClick={goBack}>Back</Button>
              <Button appearance="primary" onClick={goNext} disabled={!selectedBizId}>
                Next: Verify Subscription
              </Button>
            </Stack>
          </div>
        )}

        {/* Step 3 — Verify Subscription */}
        {step === 2 && (
          <div>
            <h5 style={{ marginBottom: 16 }}>
              Checking subscription for <strong>{ctx.brandName}</strong>
            </h5>
            {subLoading && <Loader content="Checking subscription status..." />}
            {subChecked && activeSub && (
              <Message type="success" showIcon>
                <strong>Active {activeSub.status === 'free_trial' ? 'Free Trial' : 'Subscription'}</strong>
                {activeSub.plan?.name && ` — Plan: ${activeSub.plan.name}`}
                <br />
                <span style={{ fontSize: 13, color: '#6b7280' }}>Upload is allowed.</span>
              </Message>
            )}
            {subChecked && !activeSub && (
              <Message type="error" showIcon>
                <strong>No active subscription or free trial found.</strong>
                <br />
                <span style={{ fontSize: 13 }}>This user must have an active plan before designs can be uploaded.</span>
              </Message>
            )}
            <Stack justifyContent="space-between" style={{ marginTop: 24 }}>
              <Button appearance="subtle" onClick={goBack}>Back</Button>
              <Button
                appearance="primary"
                onClick={goNext}
                disabled={!subChecked || !activeSub}
              >
                Next: Upload Design
              </Button>
            </Stack>
          </div>
        )}

        {/* Step 4 — Upload Design */}
        {step === 3 && (
          <div>
            <h5 style={{ marginBottom: 16 }}>
              Upload design files for <strong>{ctx.brandName}</strong>
            </h5>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>Description</label>
              <Input
                as="textarea"
                rows={3}
                value={description}
                onChange={setDescription}
                placeholder="Describe this design set..."
                style={{ maxWidth: 520 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>
                Files <span style={{ color: '#f5222d' }}>*</span>
              </label>
              <Uploader
                fileList={fileList}
                onChange={setFileList}
                multiple
                draggable
                autoUpload={false}
                accept="image/*,.pdf,.zip"
                style={{ maxWidth: 520 }}
              >
                <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#8e8e93' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                  <div>Drag & drop files here, or click to browse</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Supports images, PDF, ZIP</div>
                </div>
              </Uploader>
            </div>
            <Stack justifyContent="space-between">
              <Button appearance="subtle" onClick={goBack} disabled={uploading}>Back</Button>
              <Button
                appearance="primary"
                onClick={handleUpload}
                loading={uploading}
                disabled={fileList.length === 0}
              >
                Upload Design
              </Button>
            </Stack>
          </div>
        )}
      </Panel>
    </div>
  )
}

export default UploadUserDesignPage
