import { useState, useEffect, useCallback } from 'react'
import { Table, Panel, IconButton, useToaster, Message } from 'rsuite'
import EyeIcon from '@rsuite/icons/Detail'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { getFreeTrials } from '@/api/subscriptionsApi'
import { formatDate } from '@/utils/formatUtils'
import { useNavigate } from 'react-router-dom'

const { Column, HeaderCell, Cell } = Table

const deriveStatus = (row) => {
  const now = new Date()
  const start = row.start_date ? new Date(row.start_date) : null
  const end = row.end_date ? new Date(row.end_date) : null
  if (end && now > end) return 'expired'
  if (start && now >= start && (!end || now <= end)) return 'active'
  return 'free_trial'
}

const FreeTrialsPage = () => {
  const navigate = useNavigate()
  const toaster = useToaster()
  const [trials, setTrials] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortColumn, setSortColumn] = useState('start_date')
  const [sortType, setSortType] = useState('desc')

  const fetchTrials = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getFreeTrials()
      setTrials(data?.freeTrials || data?.subscriptions || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load free trials</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTrials() }, [fetchTrials])

  const handleSortColumn = (column, type) => {
    setSortColumn(column)
    setSortType(type)
  }

  const sorted = [...trials].sort((a, b) => {
    const aVal = a[sortColumn] ? new Date(a[sortColumn]) : new Date(0)
    const bVal = b[sortColumn] ? new Date(b[sortColumn]) : new Date(0)
    return sortType === 'asc' ? aVal - bVal : bVal - aVal
  })

  return (
    <div>
      <PageHeader
        title="Free Trials"
        subtitle={`${trials.length} records`}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Table
          data={sorted}
          loading={loading}
          height={500}
          bordered
          cellBordered
          rowKey="id"
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
        >
          <Column width={80}><HeaderCell>ID</HeaderCell><Cell dataKey="id" /></Column>
          <Column flexGrow={1} minWidth={140}><HeaderCell>User</HeaderCell><Cell>{(row) => row.user?.name || row.user_id}</Cell></Column>
          <Column flexGrow={1} minWidth={140}><HeaderCell>Email</HeaderCell><Cell>{(row) => row.user?.email || '—'}</Cell></Column>
          <Column width={120}><HeaderCell>Status</HeaderCell><Cell>{(row) => <StatusBadge status={deriveStatus(row)} />}</Cell></Column>
          <Column width={130} sortable><HeaderCell>Start Date</HeaderCell><Cell dataKey="start_date">{(row) => formatDate(row.start_date)}</Cell></Column>
          <Column width={130} sortable><HeaderCell>End Date</HeaderCell><Cell dataKey="end_date">{(row) => formatDate(row.end_date)}</Cell></Column>
          <Column width={100} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <IconButton icon={<EyeIcon />} size="xs" appearance="subtle" onClick={() => navigate(`/free-trials/${row.id}`)} />
              )}
            </Cell>
          </Column>
        </Table>
      </Panel>
    </div>
  )
}

export default FreeTrialsPage
