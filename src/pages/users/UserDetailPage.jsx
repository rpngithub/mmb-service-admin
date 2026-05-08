import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Panel, Stack, Button, Tag, Loader, Message, Divider, Table } from 'rsuite'
import ArrowLeftIcon from '@rsuite/icons/ArrowLeft'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { getUserById } from '@/api/usersApi'
import { getSubscriptions } from '@/api/subscriptionsApi'
import { getUserDesigns } from '@/api/userDesignsApi'
import { getUserBusinesses } from '@/api/userBusinessesApi'
import { getRoleLabel, getRoleColor } from '@/utils/roleUtils'
import { formatDate } from '@/utils/formatUtils'

const { Column, HeaderCell, Cell } = Table

const UserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])
  const [designs, setDesigns] = useState([])
  const [userBusinesses, setUserBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [userRes, subRes, bizRes] = await Promise.all([
          getUserById(id),
          getSubscriptions({ user_id: id }),
          getUserBusinesses({ user_id: id }),
        ])
        const userData = userRes.data?.user || userRes.data
        setUser(userData)
        const subs = subRes.data?.subscriptions || subRes.data || []
        setSubscriptions(subs)
        const biz = bizRes.data?.userBusinesses || bizRes.data || []
        setUserBusinesses(biz)

        if (biz.length > 0) {
          const designRes = await getUserDesigns({ user_business_id: biz[0].id })
          setDesigns(designRes.data?.userDesigns || designRes.data || [])
        }
      } catch {
        setError('Failed to load user details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <Loader center content="Loading..." size="md" style={{ marginTop: 80 }} />
  if (error) return <Message type="error" showIcon>{error}</Message>
  if (!user) return null

  const activeSub = subscriptions.find((s) => s.status === 'active' || s.status === 'free_trial')

  return (
    <div>
      <PageHeader
        title={user.name || 'User Detail'}
        actions={[
          <Button key="back" appearance="subtle" startIcon={<ArrowLeftIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
        ]}
      />

      <Stack direction="column" spacing={16} alignItems="stretch">
        <Panel bordered header="User Info" style={{ background: '#fff' }}>
          <Stack spacing={32} wrap>
            <div><div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Name</div><strong>{user.name}</strong></div>
            <div><div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Email</div>{user.email}</div>
            <div><div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Mobile</div>{user.mobile || '—'}</div>
            <div><div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Role</div><Tag color={getRoleColor(user.role)} size="sm">{getRoleLabel(user.role)}</Tag></div>
            <div><div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Joined</div>{formatDate(user.created_at)}</div>
          </Stack>
        </Panel>

        <Panel bordered header="Subscription Status" style={{ background: '#fff' }}>
          {activeSub ? (
            <Stack spacing={24} wrap>
              <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Status</div><StatusBadge status={activeSub.status} /></div>
              <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Plan</div><strong>{activeSub.plan?.name || activeSub.plan_id}</strong></div>
              <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Starts</div>{formatDate(activeSub.start_date)}</div>
              <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Ends</div>{formatDate(activeSub.end_date)}</div>
            </Stack>
          ) : (
            <Message type="warning" showIcon>No active subscription or free trial</Message>
          )}
        </Panel>

        <Panel bordered header={`Businesses (${userBusinesses.length})`} style={{ background: '#fff' }}>
          <Table data={userBusinesses} height={200} bordered cellBordered rowKey="id">
            <Column flexGrow={1} minWidth={160}><HeaderCell>Brand Name</HeaderCell><Cell dataKey="brand_name" /></Column>
            <Column width={140}><HeaderCell>City</HeaderCell><Cell dataKey="city" /></Column>
            <Column width={120}><HeaderCell>Status</HeaderCell><Cell>{(row) => <StatusBadge status={row.branding_status} />}</Cell></Column>
          </Table>
        </Panel>

        <Panel bordered header={`Designs Uploaded (${designs.length})`} style={{ background: '#fff' }}>
          <Table data={designs} height={220} bordered cellBordered rowKey="id">
            <Column flexGrow={1} minWidth={160}><HeaderCell>Description</HeaderCell><Cell dataKey="description" /></Column>
            <Column width={120}><HeaderCell>Visibility</HeaderCell><Cell>{(row) => <StatusBadge status={row.visibility} />}</Cell></Column>
            <Column width={120}><HeaderCell>Uploaded</HeaderCell><Cell>{(row) => formatDate(row.created_at)}</Cell></Column>
          </Table>
        </Panel>
      </Stack>
    </div>
  )
}

export default UserDetailPage
