import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Panel, Stack, Button, Loader, Message } from 'rsuite'
import ArrowLeftIcon from '@rsuite/icons/ArrowLeft'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { getSubscriptionById } from '@/api/subscriptionsApi'
import { formatDate, formatCurrency } from '@/utils/formatUtils'

const SubscriptionDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSubscriptionById(id)
      .then(({ data }) => setSub(data?.subscription || data))
      .catch(() => setError('Failed to load subscription'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader center content="Loading..." size="md" style={{ marginTop: 80 }} />
  if (error) return <Message type="error" showIcon>{error}</Message>
  if (!sub) return null

  return (
    <div>
      <PageHeader
        title="Subscription Detail"
        actions={[<Button key="back" appearance="subtle" startIcon={<ArrowLeftIcon />} onClick={() => navigate(-1)}>Back</Button>]}
      />
      <Panel bordered header="Subscription Info" style={{ background: '#fff' }}>
        <Stack spacing={32} wrap>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>ID</div><strong>{sub.id}</strong></div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>User</div>{sub.user?.name || sub.user_id}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Plan</div>{sub.plan?.name || sub.plan_id}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Price</div>{formatCurrency(sub.plan?.price)}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Status</div><StatusBadge status={sub.status} /></div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Start Date</div>{formatDate(sub.start_date)}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>End Date</div>{formatDate(sub.end_date)}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Created</div>{formatDate(sub.created_at)}</div>
        </Stack>
      </Panel>
    </div>
  )
}

export default SubscriptionDetailPage
