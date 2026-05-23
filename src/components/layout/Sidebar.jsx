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
import EmailIcon from '@rsuite/icons/Email'
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
  { key: '/user-designs', label: 'User Designs', icon: <ImageIcon />, roles: [ADMIN, DESIGNER] },
  { key: '/user-designs/upload', label: 'Upload Design', icon: <ImageIcon />, roles: [DESIGNER] },
  { key: '/support/customers', label: 'Customers', icon: <PeopleIcon />, roles: [CUSTOMER_SUPPORT] },
  { key: '/inquiries', label: 'Inquiries', icon: <EmailIcon />, roles: [ADMIN, CUSTOMER_SUPPORT] },
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Logo header — explicit white bg to match RSuite's Sidenav default */}
      <div style={{
        padding: sidebarCollapsed ? '14px 0' : '7px 20px',
        borderBottom: '1px solid #e5e5ea',
        background: '#f7f8fc',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      }}>
        {sidebarCollapsed ? (
          <img
            src="/apple-touch-icon.png"
            alt="MakeMyBrand"
            style={{ height: 28, width: 28, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <div>
            <img
              src="/images/mmb-logo.svg"
              alt="MakeMyBrand"
              style={{ height: 40, display: 'block' }}
            />
            {/*<div style={{ color: '#000', fontSize: 11, marginTop: 6 }}>
              Admin Console
            </div>*/}
          </div>
        )}
      </div>

      {/* Nav items */}
      <Sidenav expanded={!sidebarCollapsed} style={{ flex: 1, overflowY: 'auto' }}>
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

    </div>
  )
}

export default Sidebar
