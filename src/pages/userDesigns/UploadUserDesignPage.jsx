import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Panel, Button, SelectPicker, Message, Input, Uploader,
  useToaster, Loader, List, Divider, Tag
} from 'rsuite'
import PageHeader from '@/components/common/PageHeader'
import { getUserBusinesses } from '@/api/userBusinessesApi'
import { getSubscriptions, getFreeTrials } from '@/api/subscriptionsApi'
import { uploadUserDesign } from '@/api/userDesignsApi'

const isNotExpired = (sub) => {
  if (!sub.end_date) return true
  return new Date(sub.end_date) > new Date()
}

const UploadUserDesignPage = () => {
  const navigate = useNavigate()
  const toaster = useToaster()

  const [loading, setLoading] = useState(false)
  const [activeSubs, setActiveSubs] = useState([])
  const [freeTrials, setFreeTrials] = useState([])
  const [allBusinesses, setAllBusinesses] = useState([])

  const [selectedEntry, setSelectedEntry] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [selectedBizId, setSelectedBizId] = useState(null)

  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getSubscriptions(), getFreeTrials(), getUserBusinesses()])
      .then(([subRes, trialRes, bizRes]) => {
        const allSubs = subRes.data?.subscriptions || subRes.data || []
        const allTrials = trialRes.data?.freeTrials || trialRes.data?.subscriptions || trialRes.data || []
        setActiveSubs(allSubs.filter((s) => s.status === 'active' && isNotExpired(s)))
        setFreeTrials(allTrials.filter((s) => isNotExpired(s)))
        setAllBusinesses(bizRes.data?.userBusinesses || bizRes.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
    setSelectedBizId(null)
    setFileList([])
    setDescription('')
    setBusinesses(allBusinesses.filter((b) => b.user_id === entry.userId))
  }

  const handleUpload = async () => {
    if (!fileList.length || !selectedBizId) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('user_business_id', selectedBizId)
      formData.append('description', description)
      formData.append('visibility', 'private')
      fileList.forEach((f) => formData.append('files', f.blobFile))
      await uploadUserDesign(formData)
      toaster.push(
        <Message type="success" showIcon closable>Design uploaded successfully!</Message>,
        { placement: 'topCenter' }
      )
      navigate('/user-designs')
    } catch (err) {
      toaster.push(
        <><Message type="error" showIcon closable>{err.response?.data?.message || 'Upload failed'}</Message></>,
        { placement: 'topCenter' }
      )
    } finally {
      setUploading(false)
    }
  }

  const renderEntries = (entries, isTrial) => {
    if (entries.length === 0) {
      return (
        <div style={{ color: '#8e8e93', fontSize: 13, padding: '6px 0 10px' }}>None found</div>
      )
    }
    return entries.map((sub) => {
      const userId = sub.user?.id || sub.user_id
      const userName = sub.user?.name || 'Unknown User'
      const planLabel = isTrial ? 'Free Trial' : (sub.plan?.name || 'Plan')
      const isSelected = selectedEntry?.subscriptionId === sub.id

      return (
        <List.Item
          key={sub.id}
          onClick={() => handleSelectEntry({ userId, userName, subscriptionId: sub.id, planLabel, isTrial })}
          style={{
            cursor: 'pointer',
            padding: '10px 14px',
            borderLeft: isSelected ? '3px solid #3498ff' : '3px solid transparent',
            background: isSelected ? '#f0f7ff' : 'transparent',
            borderRadius: 4,
            marginBottom: 2,
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 14 }}>{userName}</div>
          <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>{planLabel}</div>
        </List.Item>
      )
    })
  }

  return (
    <div>
      <PageHeader
        title="Upload User Design"
        subtitle="Select a user with an active plan or free trial to upload designs"
      />

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Left: grouped subscription list */}
        <Panel bordered style={{ background: '#fff', flex: '0 0 300px', minWidth: 260 }}>
          {loading ? (
            <Loader content="Loading..." />
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#333' }}>
                Active Subscriptions
              </div>
              <List hover={false}>{renderEntries(activeSubs, false)}</List>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#333' }}>
                Free Trials
              </div>
              <List hover={false}>{renderEntries(freeTrials, true)}</List>
            </>
          )}
        </Panel>

        {/* Right: business select + upload */}
        <Panel bordered style={{ background: '#fff', flex: 1 }}>
          {!selectedEntry ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#8e8e93' }}>
              Select a user from the list to continue
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{selectedEntry.userName}</span>
                <Tag color={selectedEntry.isTrial ? 'cyan' : 'blue'}>{selectedEntry.planLabel}</Tag>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
                  Business
                </label>
                {businesses.length === 0 ? (
                  <Message type="warning" showIcon>This user has no registered businesses.</Message>
                ) : (
                  <SelectPicker
                    data={businesses.map((b) => ({ label: b.brand_name, value: b.mnemonic_id }))}
                    value={selectedBizId}
                    onChange={(val) => { setSelectedBizId(val); setFileList([]); setDescription('') }}
                    placeholder="Select a business..."
                    block
                    style={{ maxWidth: 400 }}
                  />
                )}
              </div>

              {selectedBizId && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
                      Description
                    </label>
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
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
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
                      <div
                        style={{
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          color: '#8e8e93',
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                        <div>Drag & drop files here, or click to browse</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Supports images, PDF, ZIP</div>
                      </div>
                    </Uploader>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Button appearance="subtle" onClick={() => navigate('/user-designs')} disabled={uploading}>
                      Cancel
                    </Button>
                    <Button
                      appearance="primary"
                      onClick={handleUpload}
                      loading={uploading}
                      disabled={fileList.length === 0}
                    >
                      Upload Design
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default UploadUserDesignPage
