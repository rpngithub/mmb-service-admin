import { format, parseISO, isValid } from 'date-fns'

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return isValid(d) ? format(d, fmt) : '—'
  } catch {
    return '—'
  }
}

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a')

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export const truncate = (str, len = 40) =>
  str && str.length > len ? str.slice(0, len) + '…' : str || ''
