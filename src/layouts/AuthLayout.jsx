import { Panel, FlexboxGrid } from 'rsuite'

const AuthLayout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FlexboxGrid justify="center" style={{ width: '100%', padding: '20px' }}>
        <FlexboxGrid.Item colspan={24} style={{ maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 28 }}>
              MakeMyBrand
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Admin Console</p>
          </div>
          <Panel
            bordered
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '8px',
            }}
          >
            {children}
          </Panel>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </div>
  )
}

export default AuthLayout
