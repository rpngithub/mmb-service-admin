import { Tag } from 'rsuite'

const STATUS_COLORS = {
  active: 'green',
  inactive: 'default',
  cancelled: 'red',
  expired: 'orange',
  free_trial: 'cyan',
  pending: 'yellow',
  public: 'blue',
  private: 'violet',
  'subscription-based': 'cyan',
  READY: 'green',
  ONLY_LOGO: 'yellow',
  IN_PROGRESS: 'blue',
  PENDING: 'orange',
}

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || 'default'
  return (
    <Tag color={color} size="sm">
      {status || '—'}
    </Tag>
  )
}

export default StatusBadge
