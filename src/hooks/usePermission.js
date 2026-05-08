import useAuth from './useAuth'

const usePermission = (roles) => {
  const { can } = useAuth()
  return can(roles)
}

export default usePermission
