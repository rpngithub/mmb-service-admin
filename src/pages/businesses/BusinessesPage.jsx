import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Panel, Stack, IconButton, useToaster, Message, Pagination } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import PageHeader from '@/components/common/PageHeader'
import ConfirmModal from '@/components/common/ConfirmModal'
import BusinessFormModal from './BusinessFormModal'
import { getAllBusinesses, deleteBusiness } from '@/api/businessesApi'
import { formatDate } from '@/utils/formatUtils'

const { Column, HeaderCell, Cell } = Table

const DEFAULT_LIMIT = 10

const BusinessesPage = () => {
  const toaster = useToaster()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBusiness, setEditBusiness] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAllBusinesses()
      setBusinesses(data?.businesses || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

  // Reset to page 1 when limit changes
  useEffect(() => { setPage(1) }, [limit])

  const paged = businesses.slice((page - 1) * limit, page * limit)

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteBusiness(deleteTarget.id)
      toaster.push(<Message type="success" showIcon closable>Deleted</Message>, { placement: 'topCenter' })
      setDeleteTarget(null)
      fetchBusinesses()
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to delete</Message>, { placement: 'topCenter' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Business Categories"
        subtitle={`${businesses.length} categories`}
        actions={[
          <Button key="create" appearance="primary" startIcon={<PlusIcon />} onClick={() => { setEditBusiness(null); setModalOpen(true) }}>
            Create
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Table data={paged} loading={loading} autoHeight bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={160}><HeaderCell>Name</HeaderCell><Cell dataKey="name" /></Column>
          <Column flexGrow={2} minWidth={200}><HeaderCell>Description</HeaderCell><Cell dataKey="description" /></Column>
          <Column width={120}><HeaderCell>Created</HeaderCell><Cell>{(row) => formatDate(row.created_at)}</Cell></Column>
          <Column width={100} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4}>
                  <IconButton icon={<EditIcon />} size="xs" appearance="subtle" onClick={() => { setEditBusiness(row); setModalOpen(true) }} />
                  <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" onClick={() => setDeleteTarget(row)} />
                </Stack>
              )}
            </Cell>
          </Column>
        </Table>

        <div style={{ paddingTop: 16, borderTop: '1px solid #f2f2f5' }}>
          <Pagination
            total={businesses.length}
            limit={limit}
            limitOptions={[10, 20, 50]}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={(v) => setLimit(v)}
            layout={['total', '-', 'limit', '|', 'pager']}
          />
        </div>
      </Panel>

      <BusinessFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchBusinesses} business={editBusiness} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  )
}

export default BusinessesPage
