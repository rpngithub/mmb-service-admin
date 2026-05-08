import { ROLES } from '@/config/constants'

export { ROLES }

export const hasRole = (user, role) => user?.role === role

export const hasAnyRole = (user, roles) => roles.includes(user?.role)

export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.DESIGNER]: 'Designer',
    [ROLES.CUSTOMER_SUPPORT]: 'Customer Support',
    [ROLES.USER]: 'User',
  }
  return labels[role] || role
}

export const getRoleColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'red',
    [ROLES.DESIGNER]: 'blue',
    [ROLES.CUSTOMER_SUPPORT]: 'cyan',
    [ROLES.USER]: 'green',
  }
  return colors[role] || 'default'
}
