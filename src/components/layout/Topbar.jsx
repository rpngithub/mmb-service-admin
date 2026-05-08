import { useNavigate } from 'react-router-dom'
import { Navbar, Nav, Avatar, Dropdown, IconButton, useToaster, Message } from 'rsuite'
import MenuIcon from '@rsuite/icons/Menu'
import useAuth from '@/hooks/useAuth'
import useUiStore from '@/store/uiStore'
import { logout as logoutApi } from '@/api/authApi'
import { clearTokens } from '@/utils/tokenUtils'
import { getRoleLabel } from '@/utils/roleUtils'

const Topbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toaster = useToaster()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // proceed regardless
    }
    clearTokens()
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <Navbar style={{ borderBottom: '1px solid #e5e5ea', padding: '0 8px' }}>
      <Nav>
        <Nav.Item style={{ padding: '0 8px' }}>
          <IconButton icon={<MenuIcon />} appearance="subtle" onClick={toggleSidebar} />
        </Nav.Item>
      </Nav>
      <Nav pullRight>
        <Dropdown
          placement="bottomEnd"
          renderToggle={(props, ref) => (
            <div {...props} ref={ref} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
              <Avatar circle size="sm" style={{ background: '#3498ff' }}>{initials}</Avatar>
              {user?.name && <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</span>}
              <span style={{ fontSize: 11, color: '#8e8e93', background: '#f2f3f5', padding: '2px 6px', borderRadius: 4 }}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
          )}
        >
          <Dropdown.Item onSelect={() => navigate('/profile')}>My Profile</Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item onSelect={handleLogout}>Sign Out</Dropdown.Item>
        </Dropdown>
      </Nav>
    </Navbar>
  )
}

export default Topbar
