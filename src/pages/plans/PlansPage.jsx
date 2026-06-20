import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Panel, Stack, IconButton, Tag, useToaster, Message } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import CheckIcon from '@rsuite/icons/Check'
import PageHeader from '@/components/common/PageHeader'
import ConfirmModal from '@/components/common/ConfirmModal'
import PlanFormModal from './PlanFormModal'
import { getAllPlans, deletePlan } from '@/api/plansApi'
import { formatCurrency } from '@/utils/formatUtils'

const { Column, HeaderCell, Cell } = Table

const PlansPage = () => {
  const toaster = useToaster()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAllPlans()
      setPlans(data?.plans || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load plans</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deletePlan(deleteTarget.id)
      toaster.push(<Message type="success" showIcon closable>Plan deleted</Message>, { placement: 'topCenter' })
      setDeleteTarget(null)
      fetchPlans()
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to delete</Message>, { placement: 'topCenter' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle={`${plans.length} plans`}
        actions={[
          <Button key="create" appearance="primary" startIcon={<PlusIcon />} onClick={() => { setEditPlan(null); setModalOpen(true) }}>
            Create Plan
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Table data={plans} loading={loading} height={500} bordered cellBordered rowKey="id" rowClassName={(row) => (row?.is_deleted ? 'plan-row-deleted' : '')}>
          <Column flexGrow={1} minWidth={140}><HeaderCell>Name</HeaderCell><Cell dataKey="name" /></Column>
          <Column width={120}><HeaderCell>Price</HeaderCell><Cell>{(row) => formatCurrency(row.price)}</Cell></Column>
          <Column width={120}><HeaderCell>Original</HeaderCell><Cell>{(row) => formatCurrency(row.original_price)}</Cell></Column>
          <Column width={100}><HeaderCell>Duration</HeaderCell><Cell>{(row) => `${row.duration} ${row.duration_unit}`}</Cell></Column>
          <Column width={80}><HeaderCell>Popular</HeaderCell><Cell>{(row) => row.popular ? <CheckIcon style={{ color: '#2ecc71' }} /> : null}</Cell></Column>
          <Column flexGrow={1} minWidth={200}><HeaderCell>Features</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4} wrap>
                  {(row.features || []).slice(0, 3).map((f, i) => (
                    <Tag key={i} size="sm" color="blue">{f}</Tag>
                  ))}
                  {(row.features || []).length > 3 && <Tag size="sm">+{row.features.length - 3}</Tag>}
                </Stack>
              )}
            </Cell>
          </Column>
          <Column width={90}><HeaderCell>Status</HeaderCell>
            <Cell>
              {(row) => row.is_deleted
                ? <Tag color="red" size="sm">Deleted</Tag>
                : <Tag color="green" size="sm">Active</Tag>}
            </Cell>
          </Column>
          <Column width={100} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4}>
                  <IconButton icon={<EditIcon />} size="xs" appearance="subtle" disabled={row.is_deleted} onClick={() => { setEditPlan(row); setModalOpen(true) }} />
                  <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" disabled={row.is_deleted} onClick={() => setDeleteTarget(row)} />
                </Stack>
              )}
            </Cell>
          </Column>
        </Table>
      </Panel>
      <PlanFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchPlans} plan={editPlan} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} message={`Delete plan "${deleteTarget?.name}"?`} />
    </div>
  )
}

export default PlansPage
