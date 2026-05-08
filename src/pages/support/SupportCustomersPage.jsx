import { useState, useEffect, useCallback } from 'react'
import { Table, Panel, Stack, Input, InputGroup, Drawer, Message, Loader, Tag } from 'rsuite'
import SearchIcon from '@rsuite/icons/Search'
import EyeIcon from '@rsuite/icons/Detail'
import { IconButton } from 'rsuite'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { getUsers } from '@/api/usersApi'
import { getSubscriptions } from '@/api/subscriptionsApi'
import { getUserDesigns } from '@/api/userDesignsApi'
import { getUserBusinesses } from '@/api/userBusinessesApi'
import { formatDate } from '@/utils/formatUtils'
import { ROLES } from '@/config/constants'

const { Column, HeaderCell, Cell } = Table

const CustomerDetailDrawer = ({ open, onClose, user }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !user?.id) return
    setLoading(true)
    Promise.all([
      getSubscriptions({ user_id: user.id }),
      getUserBusinesses({ user_id: user.id }),
    ]).then(async ([subRes, bizRes]) => {
      const subs = subRes.data?.subscriptions || subRes.data || []
      const businesses = bizRes.data?.userBusinesses || bizRes.data || []
      let designs = []
      if (businesses.length > 0) {
        const designRes = await getUserDesigns({ user_business_id: businesses[0].id })
        designs = designRes.data?.userDesigns || designRes.data || []
      }
      const activeSub = subs.find((s) => s.status === 'active' || s.status === 'free_trial')
      setData({ subs, businesses, designs, activeSub })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open, user?.id])

  return (
    <Drawer open={open} onClose={onClose} size="md">
      <Drawer.Header><Drawer.Title>{user?.name} — Customer Details</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        {loading && <Loader center content="Loading..." />}
        {data && (
          <Stack direction="column" spacing={20} alignItems="stretch">
            <Panel bordered header="User Info">
              <Stack spacing={24} wrap>
                <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Email</div>{user.email}</div>
                <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Mobile</div>{user.mobile || '—'}</div>
                <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Joined</div>{formatDate(user.created_at)}</div>
              </Stack>
            </Panel>

            <Panel bordered header="Subscription Status">
              {data.activeSub ? (
                <Stack spacing={24} wrap>
                  <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Status</div><StatusBadge status={data.activeSub.status} /></div>
                  <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Plan</div>{data.activeSub.plan?.name || data.activeSub.plan_id}</div>
                  <div><div style={{ color: '#8e8e93', fontSize: 12 }}>Ends</div>{formatDate(data.activeSub.end_date)}</div>
                </Stack>
              ) : (
                <Message type="warning" showIcon>No active subscription or free trial</Message>
              )}
            </Panel>

            <Panel bordered header={`Designs Uploaded (${data.designs.length})`}>
              <Table data={data.designs} height={180} bordered cellBordered rowKey="id">
                <Column flexGrow={1} minWidth={120}><HeaderCell>Description</HeaderCell><Cell dataKey="description" /></Column>
                <Column width={120}><HeaderCell>Visibility</HeaderCell><Cell>{(row) => <StatusBadge status={row.visibility} />}</Cell></Column>
                <Column width={110}><HeaderCell>Uploaded</HeaderCell><Cell>{(row) => formatDate(row.created_at)}</Cell></Column>
              </Table>
            </Panel>
          </Stack>
        )}
      </Drawer.Body>
    </Drawer>
  )
}

const SupportCustomersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getUsers()
      const all = data?.users || data || []
      setUsers(all.filter((u) => u.role === ROLES.USER))
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const viewUser = (user) => {
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${filtered.length} customers`} />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack spacing={12} style={{ marginBottom: 16 }}>
          <InputGroup inside style={{ width: 280 }}>
            <Input placeholder="Search name or email..." value={search} onChange={setSearch} />
            <InputGroup.Button><SearchIcon /></InputGroup.Button>
          </InputGroup>
        </Stack>
        <Table data={filtered} loading={loading} height={480} bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={140}><HeaderCell>Name</HeaderCell><Cell dataKey="name" /></Column>
          <Column flexGrow={1} minWidth={200}><HeaderCell>Email</HeaderCell><Cell dataKey="email" /></Column>
          <Column width={130}><HeaderCell>Mobile</HeaderCell><Cell dataKey="mobile" /></Column>
          <Column width={120}><HeaderCell>Joined</HeaderCell><Cell>{(row) => formatDate(row.created_at)}</Cell></Column>
          <Column width={80} fixed="right"><HeaderCell>View</HeaderCell>
            <Cell>
              {(row) => <IconButton icon={<EyeIcon />} size="xs" appearance="subtle" onClick={() => viewUser(row)} />}
            </Cell>
          </Column>
        </Table>
      </Panel>

      <CustomerDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}

export default SupportCustomersPage
