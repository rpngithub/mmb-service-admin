import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, InputGroup, Stack, IconButton, useToaster, Message, SelectPicker, Panel } from 'rsuite'
import SearchIcon from '@rsuite/icons/Search'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import PageHeader from '@/components/common/PageHeader'
import ConfirmModal from '@/components/common/ConfirmModal'
import StatusBadge from '@/components/common/StatusBadge'
import UserFormModal from './UserFormModal'
import { getUsers, deleteUser } from '@/api/usersApi'
import { getRoleLabel, getRoleColor } from '@/utils/roleUtils'
import { formatDate } from '@/utils/formatUtils'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/config/constants'
import { Tag } from 'rsuite'

const { Column, HeaderCell, Cell } = Table

const roleFilterOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: ROLES.ADMIN },
  { label: 'Designer', value: ROLES.DESIGNER },
  { label: 'Customer Support', value: ROLES.CUSTOMER_SUPPORT },
  { label: 'User', value: ROLES.USER },
]

const UsersPage = () => {
  const { isAdmin } = useAuth()
  const toaster = useToaster()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getUsers()
      setUsers(data?.users || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load users</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget.id)
      toaster.push(<Message type="success" showIcon closable>User deleted</Message>, { placement: 'topCenter' })
      setDeleteTarget(null)
      fetchUsers()
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to delete user</Message>, { placement: 'topCenter' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${filtered.length} users`}
        actions={isAdmin && [
          <Button key="create" appearance="primary" startIcon={<PlusIcon />} onClick={() => { setEditUser(null); setModalOpen(true) }}>
            Create User
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack spacing={12} style={{ marginBottom: 16 }}>
          <InputGroup inside style={{ width: 260 }}>
            <Input placeholder="Search name or email..." value={search} onChange={setSearch} />
            <InputGroup.Button><SearchIcon /></InputGroup.Button>
          </InputGroup>
          <SelectPicker data={roleFilterOptions} value={roleFilter} onChange={setRoleFilter} placeholder="Filter by role" style={{ width: 180 }} cleanable={false} />
        </Stack>
        <Table data={filtered} loading={loading} height={480} bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={140}>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="name" />
          </Column>
          <Column flexGrow={1} minWidth={200}>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>
          <Column width={140}>
            <HeaderCell>Role</HeaderCell>
            <Cell>
              {(row) => <Tag color={getRoleColor(row.role)} size="sm">{getRoleLabel(row.role)}</Tag>}
            </Cell>
          </Column>
          <Column width={120}>
            <HeaderCell>Joined</HeaderCell>
            <Cell>{(row) => formatDate(row.created_at)}</Cell>
          </Column>
          {isAdmin && (
            <Column width={100} fixed="right">
              <HeaderCell>Actions</HeaderCell>
              <Cell>
                {(row) => (
                  <Stack spacing={4}>
                    <IconButton icon={<EditIcon />} size="xs" appearance="subtle" onClick={() => { setEditUser(row); setModalOpen(true) }} />
                    <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" onClick={() => setDeleteTarget(row)} />
                  </Stack>
                )}
              </Cell>
            </Column>
          )}
        </Table>
      </Panel>

      {isAdmin && (
        <UserFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchUsers}
          user={editUser}
        />
      )}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        message={`Delete user "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}

export default UsersPage
