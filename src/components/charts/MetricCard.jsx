import { Panel } from 'rsuite'

const MetricCard = ({ label, value, sub, color = '#3498ff', icon }) => (
  <Panel
    bordered
    style={{
      background: '#fff',
      borderRadius: 10,
      padding: '16px 20px',
      borderLeft: `4px solid ${color}`,
      minWidth: 160,
      flex: 1,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: '#8e8e93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1f36', lineHeight: 1 }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{sub}</div>}
      </div>
      {icon && <div style={{ fontSize: 24, opacity: 0.7 }}>{icon}</div>}
    </div>
  </Panel>
)

export default MetricCard
