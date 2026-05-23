import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Panel, Stack, IconButton, useToaster, Message, Input, InputGroup, Pagination } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import SearchIcon from '@rsuite/icons/Search'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmModal from '@/components/common/ConfirmModal'
import UserBusinessFormModal from './UserBusinessFormModal'
import { getUserBusinesses, deleteUserBusiness } from '@/api/userBusinessesApi'

const { Column, HeaderCell, Cell } = Table

const DEFAULT_LIMIT = 10

const UserBusinessesPage = () => {
  const toaster = useToaster()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getUserBusinesses()
      setRecords(data?.userBusinesses || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // Reset to page 1 whenever search or limit changes
  useEffect(() => { setPage(1) }, [search, limit])

  const filtered = records.filter((r) =>
    !search || r.brand_name?.toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteUserBusiness(deleteTarget.id)
      toaster.push(<Message type="success" showIcon closable>Deleted</Message>, { placement: 'topCenter' })
      setDeleteTarget(null)
      fetchRecords()
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed</Message>, { placement: 'topCenter' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="User Businesses"
        subtitle={`${filtered.length} records`}
        actions={[
          <Button key="create" appearance="primary" startIcon={<PlusIcon />} onClick={() => { setEditRecord(null); setModalOpen(true) }}>
            Create
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack spacing={12} style={{ marginBottom: 16 }}>
          <InputGroup inside style={{ width: 260 }}>
            <Input placeholder="Search brand name..." value={search} onChange={setSearch} />
            <InputGroup.Button><SearchIcon /></InputGroup.Button>
          </InputGroup>
        </Stack>

        <Table data={paged} loading={loading} autoHeight bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={160}><HeaderCell>Brand Name</HeaderCell><Cell dataKey="brand_name" /></Column>
          <Column flexGrow={1} minWidth={120}><HeaderCell>User</HeaderCell><Cell>{(row) => row.user?.name || row.user_id}</Cell></Column>
          <Column flexGrow={1} minWidth={140}><HeaderCell>Business Category</HeaderCell><Cell>{(row) => row.business?.name || row.business_other || '—'}</Cell></Column>
          <Column width={140}><HeaderCell>City</HeaderCell><Cell dataKey="city" /></Column>
          <Column width={120}><HeaderCell>Delivery</HeaderCell><Cell dataKey="delivery_preference" /></Column>
          <Column width={120}><HeaderCell>Status</HeaderCell><Cell>{(row) => <StatusBadge status={row.branding_status} />}</Cell></Column>
          <Column width={100} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4}>
                  <IconButton icon={<EditIcon />} size="xs" appearance="subtle" onClick={() => { setEditRecord(row); setModalOpen(true) }} />
                  <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" onClick={() => setDeleteTarget(row)} />
                </Stack>
              )}
            </Cell>
          </Column>
        </Table>

        <div style={{ paddingTop: 16, borderTop: '1px solid #f2f2f5' }}>
          <Pagination
            total={filtered.length}
            limit={limit}
            limitOptions={[10, 20, 50]}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={(v) => setLimit(v)}
            layout={['total', '-', 'limit', '|', 'pager']}
          />
        </div>
      </Panel>

      <UserBusinessFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchRecords} userBusiness={editRecord} />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} message={`Delete "${deleteTarget?.brand_name}"?`} />
    </div>
  )
}

export default UserBusinessesPage
