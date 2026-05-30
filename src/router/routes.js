import { lazy } from 'react'
import { ROLES } from '@/config/constants'

const { ADMIN, DESIGNER, CUSTOMER_SUPPORT } = ROLES
const ALL_STAFF = [ADMIN, DESIGNER, CUSTOMER_SUPPORT]

// Auth pages
export const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
export const NotAuthorizedPage = lazy(() => import('@/pages/auth/NotAuthorizedPage'))

// Admin pages
export const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
export const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
export const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'))
export const PlansPage = lazy(() => import('@/pages/plans/PlansPage'))
export const SubscriptionsPage = lazy(() => import('@/pages/subscriptions/SubscriptionsPage'))
export const SubscriptionDetailPage = lazy(() => import('@/pages/subscriptions/SubscriptionDetailPage'))
export const FreeTrialsPage = lazy(() => import('@/pages/freeTrials/FreeTrialsPage'))
export const FreeTrialDetailPage = lazy(() => import('@/pages/freeTrials/FreeTrialDetailPage'))
export const DesignsPage = lazy(() => import('@/pages/designs/DesignsPage'))
export const BusinessesPage = lazy(() => import('@/pages/businesses/BusinessesPage'))
export const UserBusinessesPage = lazy(() => import('@/pages/userBusinesses/UserBusinessesPage'))
export const UserDesignsPage = lazy(() => import('@/pages/userDesigns/UserDesignsPage'))
export const UploadUserDesignPage = lazy(() => import('@/pages/userDesigns/UploadUserDesignPage'))
export const SupportCustomersPage = lazy(() => import('@/pages/support/SupportCustomersPage'))
export const InquiriesPage = lazy(() => import('@/pages/inquiries/InquiriesPage'))
export const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))

export const ROUTES = [
  { path: '/dashboard', component: DashboardPage, roles: [ADMIN] },
  { path: '/users', component: UsersPage, roles: [ADMIN, CUSTOMER_SUPPORT] },
  { path: '/users/:id', component: UserDetailPage, roles: [ADMIN, CUSTOMER_SUPPORT] },
  { path: '/plans', component: PlansPage, roles: [ADMIN] },
  { path: '/subscriptions', component: SubscriptionsPage, roles: [ADMIN] },
  { path: '/subscriptions/:id', component: SubscriptionDetailPage, roles: [ADMIN, CUSTOMER_SUPPORT] },
  { path: '/free-trials', component: FreeTrialsPage, roles: [ADMIN] },
  { path: '/free-trials/:id', component: FreeTrialDetailPage, roles: [ADMIN] },
  { path: '/designs', component: DesignsPage, roles: [ADMIN, DESIGNER] },
  { path: '/businesses', component: BusinessesPage, roles: [ADMIN] },
  { path: '/user-businesses', component: UserBusinessesPage, roles: [ADMIN] },
  { path: '/user-designs', component: UserDesignsPage, roles: [ADMIN, DESIGNER] },
  { path: '/user-designs/upload', component: UploadUserDesignPage, roles: [DESIGNER] },
  { path: '/support/customers', component: SupportCustomersPage, roles: [CUSTOMER_SUPPORT] },
  { path: '/inquiries', component: InquiriesPage, roles: [ADMIN, CUSTOMER_SUPPORT] },
  { path: '/profile', component: ProfilePage, roles: ALL_STAFF },
]
