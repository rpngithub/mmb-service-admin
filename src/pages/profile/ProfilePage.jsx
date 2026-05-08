import { useState, useEffect, useRef } from 'react'
import { Panel, Stack, Input, Button, Uploader, useToaster, Message, Loader, Avatar } from 'rsuite'
import PageHeader from '@/components/common/PageHeader'
import FormField from '@/components/common/FormField'
import { getProfile, updateProfile } from '@/api/profileApi'
import useAuth from '@/hooks/useAuth'

const ProfilePage = () => {
  const { user, setAuth } = useAuth()
  const toaster = useToaster()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        const p = data?.user || data
        setProfile(p)
        setForm({ name: p.name || '', email: p.email || '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      fileList.forEach((f) => formData.append('files', f.blobFile))
      const { data } = await updateProfile(formData)
      toaster.push(<Message type="success" showIcon closable>Profile updated</Message>, { placement: 'topCenter' })
      if (data?.user) setProfile(data.user)
      setFileList([])
    } catch (err) {
      toaster.push(<Message type="error" showIcon closable>{err.response?.data?.message || 'Update failed'}</Message>, { placement: 'topCenter' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader center size="md" content="Loading profile..." style={{ marginTop: 80 }} />

  const initials = form.name
    ? form.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="My Profile" />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack direction="column" spacing={20} alignItems="stretch">
          <Stack alignItems="center" spacing={16} style={{ marginBottom: 8 }}>
            <Avatar circle size="lg" style={{ background: '#3498ff', fontSize: 20 }}>{initials}</Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{form.name}</div>
              <div style={{ color: '#8e8e93', fontSize: 13 }}>{user?.role}</div>
            </div>
          </Stack>

          <FormField label="Name" name="name" required>
            <Input value={form.name} onChange={set('name')} />
          </FormField>
          <FormField label="Email" name="email" required>
            <Input value={form.email} type="email" onChange={set('email')} />
          </FormField>

          <FormField label="Profile Picture / Assets" name="files">
            <Uploader
              fileList={fileList}
              onChange={setFileList}
              autoUpload={false}
              multiple
              accept="image/*"
            >
              <Button appearance="ghost">Upload files</Button>
            </Uploader>
          </FormField>

          <Stack justifyContent="flex-end">
            <Button appearance="primary" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </Panel>
    </div>
  )
}

export default ProfilePage
