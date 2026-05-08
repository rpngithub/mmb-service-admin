import { useState, useEffect } from 'react'
import { Panel, Stack, Loader, Message, Table } from 'rsuite'
import { format, subDays, parseISO, isAfter } from 'date-fns'
import MetricCard from '@/components/charts/MetricCard'
import AppAreaChart from '@/components/charts/AppAreaChart'
import AppBarChart from '@/components/charts/AppBarChart'
import AppPieChart from '@/components/charts/AppPieChart'
import StatusBadge from '@/components/common/StatusBadge'
import PageHeader from '@/components/common/PageHeader'
import { getUsers } from '@/api/usersApi'
import { getSubscriptions } from '@/api/subscriptionsApi'
import { getAllPlans } from '@/api/plansApi'
import { getDesigns } from '@/api/designsApi'
import { getAllBusinesses } from '@/api/businessesApi'
import { formatDate, formatCurrency } from '@/utils/formatUtils'
import { ROLES } from '@/config/constants'

const { Column, HeaderCell, Cell } = Table

const groupByDay = (items, dateField, days = 30) => {
  const result = {}
  const cutoff = subDays(new Date(), days)
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'MM/dd')
    result[d] = 0
  }
  items.forEach((item) => {
    try {
      const d = parseISO(item[dateField])
      if (isAfter(d, cutoff)) {
        const key = format(d, 'MM/dd')
        if (key in result) result[key]++
      }
    } catch {}
  })
  return Object.entries(result).map(([date, count]) => ({ date, count }))
}

const groupByMonth = (items, dateField, valueField, months = 6) => {
  const result = {}
  for (let i = months - 1; i >= 0; i--) {
    const key = format(subDays(new Date(), i * 30), 'MMM yy')
    result[key] = 0
  }
  items.forEach((item) => {
    try {
      const d = parseISO(item[dateField])
      const key = format(d, 'MMM yy')
      if (key in result) result[key] += Number(item[valueField] || 0)
    } catch {}
  })
  return Object.entries(result).map(([month, value]) => ({ month, value }))
}

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, subsRes, plansRes, designsRes, bizRes] = await Promise.all([
          getUsers(),
          getSubscriptions(),
          getAllPlans(),
          getDesigns(),
          getAllBusinesses(),
        ])
        const users = usersRes.data?.users || usersRes.data || []
        const subs = subsRes.data?.subscriptions || subsRes.data || []
        const plans = plansRes.data?.plans || plansRes.data || []
        const designs = designsRes.data?.designs || designsRes.data || []
        const businesses = bizRes.data?.businesses || bizRes.data || []

        const activeSubs = subs.filter((s) => s.status === 'active')
        const planMap = Object.fromEntries(plans.map((p) => [p.id, p]))
        const revenue = activeSubs.reduce((sum, s) => sum + (planMap[s.plan_id]?.price || 0), 0)

        // Signups per day (last 30 days)
        const signupData = groupByDay(users, 'created_at', 30)

        // Subs by plan
        const subsByPlan = {}
        subs.forEach((s) => {
          const name = planMap[s.plan_id]?.name || `Plan ${s.plan_id}`
          subsByPlan[name] = (subsByPlan[name] || 0) + 1
        })
        const subsByPlanData = Object.entries(subsByPlan).map(([name, value]) => ({ name, value }))

        // Designs per designer (by created_by)
        const designerMap = {}
        designs.forEach((d) => {
          const key = `User ${d.created_by}`
          designerMap[key] = (designerMap[key] || 0) + 1
        })
        const designerData = Object.entries(designerMap).map(([name, count]) => ({ name, count }))

        // Revenue by month (last 6 months, based on subscription creation date)
        const revenueByMonth = groupByMonth(
          activeSubs.map((s) => ({ ...s, price: planMap[s.plan_id]?.price || 0 })),
          'created_at',
          'price',
          6
        )

        // Recent 10 subscriptions
        const recentSubs = [...subs]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          .map((s) => ({ ...s, planName: planMap[s.plan_id]?.name || s.plan_id }))

        setMetrics({
          totalUsers: users.length,
          newUsersThisMonth: users.filter((u) => {
            try { return isAfter(parseISO(u.created_at), subDays(new Date(), 30)) } catch { return false }
          }).length,
          activeSubsCount: activeSubs.length,
          revenue,
          totalDesigns: designs.length,
          totalBusinesses: businesses.length,
          plansCount: plans.length,
          signupData,
          subsByPlanData,
          designerData,
          revenueByMonth,
          recentSubs,
        })
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loader center size="lg" content="Loading dashboard..." style={{ marginTop: 80 }} />
  if (error) return <Message type="error" showIcon>{error}</Message>

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Analytics overview" />

      {/* KPI Cards */}
      <Stack spacing={16} wrap style={{ marginBottom: 24 }}>
        <MetricCard label="Total Users" value={metrics.totalUsers} sub={`+${metrics.newUsersThisMonth} this month`} color="#3498ff" icon="👥" />
        <MetricCard label="Active Subscriptions" value={metrics.activeSubsCount} color="#2ecc71" icon="📋" />
        <MetricCard label="Est. Revenue" value={formatCurrency(metrics.revenue)} sub="from active subs" color="#e74c3c" icon="💰" />
        <MetricCard label="Designs" value={metrics.totalDesigns} color="#9b59b6" icon="🎨" />
        <MetricCard label="Businesses" value={metrics.totalBusinesses} color="#f39c12" icon="🏢" />
        <MetricCard label="Plans" value={metrics.plansCount} color="#1abc9c" icon="📦" />
      </Stack>

      {/* Row 1 */}
      <Stack spacing={16} style={{ marginBottom: 24 }} wrap>
        <Panel bordered header="Signups (Last 30 Days)" style={{ background: '#fff', flex: 2, minWidth: 300 }}>
          <AppAreaChart data={metrics.signupData} xKey="date" yKey="count" label="Signups" color="#3498ff" />
        </Panel>
        <Panel bordered header="Subscriptions by Plan" style={{ background: '#fff', flex: 1, minWidth: 260 }}>
          <AppPieChart data={metrics.subsByPlanData} nameKey="name" valueKey="value" />
        </Panel>
      </Stack>

      {/* Row 2 */}
      <Stack spacing={16} style={{ marginBottom: 24 }} wrap>
        <Panel bordered header="Designs per Designer" style={{ background: '#fff', flex: 1, minWidth: 260 }}>
          <AppBarChart data={metrics.designerData} xKey="name" yKey="count" label="Designs" multiColor />
        </Panel>
        <Panel bordered header="Revenue by Month (₹)" style={{ background: '#fff', flex: 1, minWidth: 260 }}>
          <AppBarChart data={metrics.revenueByMonth} xKey="month" yKey="value" label="Revenue" color="#2ecc71" />
        </Panel>
      </Stack>

      {/* Recent Subscriptions Table */}
      <Panel bordered header="Recent Subscriptions" style={{ background: '#fff' }}>
        <Table data={metrics.recentSubs} height={280} bordered cellBordered rowKey="id">
          <Column flexGrow={1} minWidth={120}><HeaderCell>User</HeaderCell><Cell>{(row) => row.user?.name || row.user_id}</Cell></Column>
          <Column flexGrow={1} minWidth={120}><HeaderCell>Plan</HeaderCell><Cell>{(row) => row.planName}</Cell></Column>
          <Column width={120}><HeaderCell>Status</HeaderCell><Cell>{(row) => <StatusBadge status={row.status} />}</Cell></Column>
          <Column width={120}><HeaderCell>Start Date</HeaderCell><Cell>{(row) => formatDate(row.start_date)}</Cell></Column>
          <Column width={120}><HeaderCell>End Date</HeaderCell><Cell>{(row) => formatDate(row.end_date)}</Cell></Column>
        </Table>
      </Panel>
    </div>
  )
}

export default DashboardPage
