import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Panel, Stack, IconButton, useToaster, Message, SelectPicker } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import TrashIcon from '@rsuite/icons/Trash'
import DownloadIcon from '@rsuite/icons/Export'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmModal from '@/components/common/ConfirmModal'
import { getUserDesigns, deleteUserDesign, getUserDesignFile } from '@/api/userDesignsApi'
import { getUserBusinesses } from '@/api/userBusinessesApi'
import { formatDate } from '@/utils/formatUtils'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/config/constants'

const { Column, HeaderCell, Cell } = Table

const UserDesignsPage = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const toaster = useToaster()
  const [designs, setDesigns] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [bizFilter, setBizFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    getUserBusinesses()
      .then(({ data }) => {
        const biz = data?.userBusinesses || data || []
        setBusinesses(biz.map((b) => ({ label: b.brand_name, value: String(b.id) })))
      })
      .catch(() => {})
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = bizFilter ? { user_business_id: bizFilter } : {}
      const { data } = await getUserDesigns(params)
      setDesigns(data?.userDesigns || data || [])
    } catch {
      toaster.push(<Message type="error" showIcon closable>Failed to load</Message>, { placement: 'topCenter' })
    } finally {
      setLoading(false)
    }
  }, [bizFilter])

  useEffect(() => { fetch() }, [fetch])

  const handleDownload = async (row) => {
    try {
      const { data } = await getUserDesignFile(row.id)
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `design-${row.id}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toaster.push(<Message type="error" showIcon closable>Download failed</Message>, { placement: 'topCenter' })
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteUserDesign(deleteTarget.id)
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
        title="User Designs"
        subtitle={`${designs.length} designs`}
        actions={[
          <Button key="upload" appearance="primary" startIcon={<PlusIcon />} onClick={() => navigate('/user-designs/upload')}>
            Upload Design
          </Button>
        ]}
      />
      <Panel bordered style={{ background: '#fff' }}>
        <Stack spacing={12} style={{ marginBottom: 16 }}>
          <SelectPicker
            data={[{ label: 'All Businesses', value: '' }, ...businesses]}
            value={bizFilter}
            onChange={(v) => setBizFilter(v || '')}
            placeholder="Filter by business"
            style={{ width: 220 }}
            cleanable={false}
          />
        </Stack>
        <Table data={designs} loading={loading} height={500} bordered cellBordered rowKey="id">
          <Column width={80}><HeaderCell>ID</HeaderCell><Cell dataKey="id" /></Column>
          <Column flexGrow={1} minWidth={160}><HeaderCell>Brand / Business</HeaderCell><Cell>{(row) => row.userBusiness?.brand_name || row.user_business_id}</Cell></Column>
          <Column flexGrow={2} minWidth={180}><HeaderCell>Description</HeaderCell><Cell dataKey="description" /></Column>
          <Column width={120}><HeaderCell>Visibility</HeaderCell><Cell>{(row) => <StatusBadge status={row.visibility} />}</Cell></Column>
          <Column width={120}><HeaderCell>Uploaded</HeaderCell><Cell>{(row) => formatDate(row.created_at)}</Cell></Column>
          <Column width={110} fixed="right"><HeaderCell>Actions</HeaderCell>
            <Cell>
              {(row) => (
                <Stack spacing={4}>
                  <IconButton icon={<DownloadIcon />} size="xs" appearance="subtle" onClick={() => handleDownload(row)} />
                  <IconButton icon={<TrashIcon />} size="xs" appearance="subtle" color="red" onClick={() => setDeleteTarget(row)} />
                </Stack>
              )}
            </Cell>
          </Column>
        </Table>
      </Panel>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} message="Delete this user design?" />
    </div>
  )
}

export default UserDesignsPage
