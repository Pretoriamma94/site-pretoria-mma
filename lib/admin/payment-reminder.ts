import { resteAPayer } from '@/lib/admin/labels';
import { isPackFamilyChild } from '@/lib/admin/pack-family';

export function isPaymentReminderOverdue(row: Parameters<typeof resteAPayer>[0] & { created_at?: string | null }, now = new Date()): boolean {
  if (row.status === 'cancelled' || isPackFamilyChild(row) || resteAPayer(row) <= 0 || Number(row.montant_paye ?? 0) > 0 || !row.created_at) return false;
  const created = new Date(row.created_at);
  if (!Number.isFinite(created.getTime())) return false;
  // Compare calendar days in the club’s timezone, including across DST changes.
  const day = (value: Date) => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
    const part = (key: string) => Number(parts.find(p => p.type === key)?.value);
    return Date.UTC(part('year'), part('month') - 1, part('day'));
  };
  return day(now) - day(created) >= 30 * 86400000;
}
