import { Outlet } from 'react-router-dom'
import { Container, Sidebar as RSidebar, Header, Content } from 'rsuite'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import useUiStore from '@/store/uiStore'

const AdminLayout = () => {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)

  return (
    <Container style={{ height: '100vh', overflow: 'hidden' }}>
      <RSidebar
        width={sidebarCollapsed ? 56 : 240}
        collapsible
        style={{
          background: '#1a1f36',
          transition: 'width 0.2s',
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </RSidebar>
      <Container style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header style={{ flexShrink: 0 }}>
          <Topbar />
        </Header>
        <Content
          style={{
            padding: '24px',
            overflowY: 'auto',
            background: '#f7f8fc',
            flex: 1,
          }}
        >
          <Outlet />
        </Content>
      </Container>
    </Container>
  )
}

export default AdminLayout
