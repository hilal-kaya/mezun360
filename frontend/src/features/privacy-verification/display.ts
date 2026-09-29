import type { Status } from './queries'
export const statusLabels: Record<Status, string> = { PENDING: 'Doğrulama Bekliyor', VERIFIED: 'Doğrulanmış Mezun', REJECTED: 'Doğrulama Tamamlanamadı' }
export function reviewDate(value?: string | null) { return value ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(value)) : '—' }
