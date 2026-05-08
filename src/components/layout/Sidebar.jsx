import { useNavigate, useLocation } from 'react-router-dom'
import { Sidenav, Nav } from 'rsuite'
import DashboardIcon from '@rsuite/icons/Dashboard'
import PeopleIcon from '@rsuite/icons/Peoples'
import ListIcon from '@rsuite/icons/List'
import DetailIcon from '@rsuite/icons/Detail'
import ImageIcon from '@rsuite/icons/Image'
import FolderIcon from '@rsuite/icons/Folder'
import StorageIcon from '@rsuite/icons/Storage'
import UserInfoIcon from '@rsuite/icons/UserInfo'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/config/constants'
import useUiStore from '@/store/uiStore'

const { ADMIN, DESIGNER, CUSTOMER_SUPPORT } = ROLES

const NAV_ITEMS = [
  { key: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, roles: [ADMIN] },
  { key: '/users', label: 'Users', icon: <PeopleIcon />, roles: [ADMIN, CUSTOMER_SUPPORT] },
  { key: '/plans', label: 'Plans', icon: <ListIcon />, roles: [ADMIN] },
  { key: '/subscriptions', label: 'Subscriptions', icon: <DetailIcon />, roles: [ADMIN] },
  { key: '/businesses', label: 'Businesses', icon: <StorageIcon />, roles: [ADMIN] },
  { key: '/user-businesses', label: 'User Businesses', icon: <FolderIcon />, roles: [ADMIN] },
  { key: '/designs', label: 'Designs', icon: <ImageIcon />, roles: [ADMIN, DESIGNER] },
  { key: '/user-designs', label: 'User Designs', icon: <ImageIcon />, roles: [ADMIN, DESIGNER] },
  { key: '/user-designs/upload', label: 'Upload Design', icon: <ImageIcon />, roles: [DESIGNER] },
  { key: '/support/customers', label: 'Customers', icon: <PeopleIcon />, roles: [CUSTOMER_SUPPORT] },
  { key: '/profile', label: 'Profile', icon: <UserInfoIcon />, roles: [ADMIN, DESIGNER, CUSTOMER_SUPPORT] },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  )

  return (
    <Sidenav
      expanded={!sidebarCollapsed}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <Sidenav.Header>
        <div
          style={{
            padding: sidebarCollapsed ? '18px 0' : '18px 20px',
            textAlign: sidebarCollapsed ? 'center' : 'left',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {!sidebarCollapsed && (
            <>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>MakeMyBrand</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>Admin Console</div>
            </>
          )}
          {sidebarCollapsed && (
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>MB</div>
          )}
        </div>
      </Sidenav.Header>
      <Sidenav.Body>
        <Nav activeKey={pathname} onSelect={(key) => navigate(key)}>
          {visibleItems.map((item) => (
            <Nav.Item key={item.key} eventKey={item.key} icon={item.icon}>
              {item.label}
            </Nav.Item>
          ))}
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  )
}

export default Sidebar
