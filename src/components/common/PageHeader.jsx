import { Stack } from 'rsuite'

const PageHeader = ({ title, subtitle, actions }) => (
  <Stack justifyContent="space-between" alignItems="flex-start" style={{ marginBottom: 20 }}>
    <div>
      <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1a1f36' }}>{title}</h4>
      {subtitle && <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>{subtitle}</p>}
    </div>
    {actions && <Stack spacing={8}>{actions}</Stack>}
  </Stack>
)

export default PageHeader
