import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Panel, Stack, IconButton, useToaster, Message } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmModal from '@/components/common/ConfirmModal'
import DesignFormModal from './DesignFormModal'
import { getDesigns, deleteDesign } from '@/api/designsApi'
import { formatDate } from '@/utils/formatUtils'

const { Column, HeaderCell, Cell } = Table

const DesignsPage = () => {
  const toaster = useToaster()
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDesign, setEditDesign] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getDesigns()
      setDesigns(data?.designs || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteDesign(deleteTarget.id)
      toaster.push(<Message type="success" showIcon closable>Deleted</Message>, { placement: 'topCenter' })
      setDeleteTarget(null); fetch()
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed</Message>, { placement: 'topCenter' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Designs Library"
        subtitle={`${designs.length} designs`}
        actions={[
          <Button key="create" appearance="primary" startIcon={<PlusIcon />} onClick={() => { setEditDesign(null); setModalOpen(true) }}>
            Create Design
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Table data={designs} loading={loading} height={500} bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={180}><HeaderCell>Title</HeaderCell><Cell dataKey="title" /></Column>
          <Column flexGrow={2} minWidth={200}><HeaderCell>Description</HeaderCell><Cell dataKey="description" /></Column>
          <Column width={130}><HeaderCell>Visibility</HeaderCell><Cell>{(row) => <StatusBadge status={row.visibility} />}</Cell></Column>
          <Column width={120}><HeaderCell>Created</HeaderCell><Cell>{(row) => formatDate(row.created_at)}</Cell></Column>
          <Column width={100} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4}>
                  <IconButton icon={<EditIcon />} size="xs" appearance="subtle" onClick={() => { setEditDesign(row); setModalOpen(true) }} />
                  <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" onClick={() => setDeleteTarget(row)} />
                </Stack>
              )}
            </Cell>
          </Column>
        </Table>
      </Panel>
      <DesignFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetch} design={editDesign} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  )
}

export default DesignsPage
