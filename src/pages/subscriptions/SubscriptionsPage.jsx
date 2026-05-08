import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Panel, Stack, IconButton, SelectPicker, useToaster, Message } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import EyeIcon from '@rsuite/icons/Detail'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmModal from '@/components/common/ConfirmModal'
import SubscriptionFormModal from './SubscriptionFormModal'
import { getSubscriptions, deleteSubscription } from '@/api/subscriptionsApi'
import { formatDate } from '@/utils/formatUtils'
import { useNavigate } from 'react-router-dom'

const { Column, HeaderCell, Cell } = Table

const STATUS_FILTER = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Free Trial', value: 'free_trial' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
]

const SubscriptionsPage = () => {
  const navigate = useNavigate()
  const toaster = useToaster()
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getSubscriptions()
      setSubs(data?.subscriptions || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load subscriptions</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  const filtered = statusFilter ? subs.filter((s) => s.status === statusFilter) : subs

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteSubscription(deleteTarget.id)
      toaster.push(<Message type="success" showIcon closable>Subscription deleted</Message>, { placement: 'topCenter' })
      setDeleteTarget(null)
      fetchSubs()
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to delete</Message>, { placement: 'topCenter' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle={`${filtered.length} records`}
        actions={[
          <Button key="create" appearance="primary" startIcon={<PlusIcon />} onClick={() => { setEditSub(null); setModalOpen(true) }}>
            Create
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack spacing={12} style={{ marginBottom: 16 }}>
          <SelectPicker data={STATUS_FILTER} value={statusFilter} onChange={setStatusFilter} placeholder="Filter by status" style={{ width: 180 }} cleanable={false} />
        </Stack>
        <Table data={filtered} loading={loading} height={500} bordered cellBordered rowKey="id">
          <Column width={80}><HeaderCell>ID</HeaderCell><Cell dataKey="id" /></Column>
          <Column flexGrow={1} minWidth={140}><HeaderCell>User</HeaderCell><Cell>{(row) => row.user?.name || row.user_id}</Cell></Column>
          <Column flexGrow={1} minWidth={140}><HeaderCell>Plan</HeaderCell><Cell>{(row) => row.plan?.name || row.plan_id}</Cell></Column>
          <Column width={120}><HeaderCell>Status</HeaderCell><Cell>{(row) => <StatusBadge status={row.status} />}</Cell></Column>
          <Column width={120}><HeaderCell>Start Date</HeaderCell><Cell>{(row) => formatDate(row.start_date)}</Cell></Column>
          <Column width={120}><HeaderCell>End Date</HeaderCell><Cell>{(row) => formatDate(row.end_date)}</Cell></Column>
          <Column width={120} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4}>
                  <IconButton icon={<EyeIcon />} size="xs" appearance="subtle" onClick={() => navigate(`/subscriptions/${row.id}`)} />
                  <IconButton icon={<EditIcon />} size="xs" appearance="subtle" onClick={() => { setEditSub(row); setModalOpen(true) }} />
                  <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" onClick={() => setDeleteTarget(row)} />
                </Stack>
              )}
            </Cell>
          </Column>
        </Table>
      </Panel>
      <SubscriptionFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchSubs} subscription={editSub} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} message="Delete this subscription?" />
    </div>
  )
}

export default SubscriptionsPage
