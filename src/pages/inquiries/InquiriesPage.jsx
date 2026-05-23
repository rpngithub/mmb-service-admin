import { useState, useEffect, useCallback } from 'react'
import {
  Table, Panel, Stack, SelectPicker, IconButton, Drawer,
  Message, useToaster, Tag, Divider, Button
} from 'rsuite'
import EyeIcon from '@rsuite/icons/Detail'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { getInquiries, updateInquiryStatus } from '@/api/inquiriesApi'
import { formatDate } from '@/utils/formatUtils'

const { Column, HeaderCell, Cell } = Table

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
]

const STATUS_FILTER = [{ label: 'All', value: '' }, ...STATUS_OPTIONS]

const InquiryDrawer = ({ inquiry, open, onClose, onStatusUpdated }) => {
  const toaster = useToaster()
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (inquiry) setStatus(inquiry.status)
  }, [inquiry])

  const handleUpdate = async () => {
    if (!status || status === inquiry?.status) return
    setLoading(true)
    try {
      await updateInquiryStatus(inquiry.id, status)
      toaster.push(<Message type="success" showIcon closable>Status updated</Message>, { placement: 'topCenter' })
      onStatusUpdated()
      onClose()
    } catch (err) {
      toaster.push(<Message type="error" showIcon closable>{err.response?.data?.message || 'Failed to update'}</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} size="sm">
      <Drawer.Header>
        <Drawer.Title>Inquiry from {inquiry?.name}</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        {inquiry && (
          <Stack direction="column" spacing={16} alignItems="stretch">
            <Stack spacing={32} wrap>
              <div>
                <div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Name</div>
                <div>{inquiry.name}</div>
              </div>
              <div>
                <div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Email</div>
                <div>{inquiry.email}</div>
              </div>
              {inquiry.phone && (
                <div>
                  <div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Phone</div>
                  <div>{inquiry.phone}</div>
                </div>
              )}
              <div>
                <div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 4 }}>Received</div>
                <div>{formatDate(inquiry.created_at)}</div>
              </div>
            </Stack>

            <Divider style={{ margin: '4px 0' }} />

            <div>
              <div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 8 }}>Notes</div>
              <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', lineHeight: 1.6 }}>
                {inquiry.notes}
              </div>
            </div>

            <Divider style={{ margin: '4px 0' }} />

            <div>
              <div style={{ color: '#8e8e93', fontSize: 12, marginBottom: 8 }}>Update Status</div>
              <Stack spacing={12}>
                <SelectPicker
                  data={STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  cleanable={false}
                  style={{ width: 180 }}
                />
                <Button
                  appearance="primary"
                  onClick={handleUpdate}
                  loading={loading}
                  disabled={status === inquiry.status}
                >
                  Save
                </Button>
              </Stack>
            </div>
          </Stack>
        )}
      </Drawer.Body>
    </Drawer>
  )
}

const InquiriesPage = () => {
  const toaster = useToaster()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getInquiries()
      setInquiries(data?.data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load inquiries</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const filtered = statusFilter ? inquiries.filter((i) => i.status === statusFilter) : inquiries

  const openDrawer = (row) => {
    setSelected(row)
    setDrawerOpen(true)
  }

  return (
    <div>
      <PageHeader title="Inquiries" subtitle={`${filtered.length} records`} />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack spacing={12} style={{ marginBottom: 16 }}>
          <SelectPicker
            data={STATUS_FILTER}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
            style={{ width: 180 }}
            cleanable={false}
          />
        </Stack>
        <Table data={filtered} loading={loading} height={500} bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={130}>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="name" />
          </Column>
          <Column flexGrow={1} minWidth={180}>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>
          <Column width={130}>
            <HeaderCell>Phone</HeaderCell>
            <Cell dataKey="phone" />
          </Column>
          <Column flexGrow={2} minWidth={200}>
            <HeaderCell>Notes</HeaderCell>
            <Cell>
              {(row) => (
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.notes}
                </span>
              )}
            </Cell>
          </Column>
          <Column width={120}>
            <HeaderCell>Status</HeaderCell>
            <Cell>{(row) => <StatusBadge status={row.status} />}</Cell>
          </Column>
          <Column width={120}>
            <HeaderCell>Received</HeaderCell>
            <Cell>{(row) => formatDate(row.created_at)}</Cell>
          </Column>
          <Column width={70} fixed="right">
            <HeaderCell>View</HeaderCell>
            <Cell>
              {(row) => (
                <IconButton icon={<EyeIcon />} size="xs" appearance="subtle" onClick={() => openDrawer(row)} />
              )}
            </Cell>
          </Column>
        </Table>
      </Panel>

      <InquiryDrawer
        inquiry={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusUpdated={fetchInquiries}
      />
    </div>
  )
}

export default InquiriesPage
