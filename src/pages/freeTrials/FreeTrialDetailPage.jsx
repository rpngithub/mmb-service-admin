import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Panel, Stack, Button, Loader, Message } from 'rsuite'
import ArrowLeftIcon from '@rsuite/icons/ArrowLeft'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { getFreeTrialById } from '@/api/subscriptionsApi'
import { formatDate } from '@/utils/formatUtils'

const FreeTrialDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trial, setTrial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getFreeTrialById(id)
      .then(({ data }) => setTrial(data?.freeTrial || data?.subscription || data))
      .catch(() => setError('Failed to load free trial'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader center content="Loading..." size="md" style={{ marginTop: 80 }} />
  if (error) return <Message type="error" showIcon>{error}</Message>
  if (!trial) return null

  return (
    <div>
      <PageHeader
        title="Free Trial Detail"
        actions={[<Button key="back" appearance="subtle" startIcon={<ArrowLeftIcon />} onClick={() => navigate(-1)}>Back</Button>]}
      />
      <Panel bordered header="Trial Info" style={{ background: '#fff' }}>
        <Stack spacing={32} wrap>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>ID</div><strong>{trial.id}</strong></div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>User</div>{trial.user?.name || trial.user_id}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Email</div>{trial.user?.email || '—'}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Status</div><StatusBadge status={trial.status} /></div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Start Date</div>{formatDate(trial.start_date)}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>End Date</div>{formatDate(trial.end_date)}</div>
          <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Created</div>{formatDate(trial.created_at)}</div>
        </Stack>
      </Panel>
    </div>
  )
}

export default FreeTrialDetailPage
