'use client';
import { useEffect, useState } from 'react';
import { loadMemberLicences, setMemberLicence } from './licence-actions';
import type { Database } from '@/types/database';
type Row = Database['public']['Tables']['member_licences']['Row'];
export function useMemberLicences(ids: string[]) {
 const key = ids.join(',');
 const [state, setState] = useState<{ key: string; rows: Record<string, Row>; error: string | null } | null>(null);
 const [busy, setBusy] = useState<Record<string, boolean>>({});
 const [errors, setErrors] = useState<Record<string, string>>({});
 useEffect(() => {
  let active = true;
  loadMemberLicences(key ? key.split(',') : []).then(result => {
   if (active) setState({ key, rows: result.success ? Object.fromEntries(result.rows.map(r => [r.inscription_id, r])) : {}, error: result.success ? null : result.error });
  }).catch(() => { if (active) setState({ key, rows: {}, error: 'Impossible de charger le suivi des licences.' }); });
  return () => { active = false; };
 }, [key]);
 async function change(id: string, taken: boolean) {
  setBusy(prev => ({ ...prev, [id]: true })); setErrors(prev => ({ ...prev, [id]: '' }));
  try {
   const result = await setMemberLicence(id, taken);
   if (!result.success) { setErrors(prev => ({ ...prev, [id]: result.error })); return; }
   setState(prev => prev ? { ...prev, rows: { ...prev.rows, [id]: result.row } } : prev);
  } catch { setErrors(prev => ({ ...prev, [id]: 'Enregistrement impossible. Réessayez.' })); }
  finally { setBusy(prev => ({ ...prev, [id]: false })); }
 }
 return { rows: state?.key === key ? state.rows : {}, ready: state?.key === key && !state.error, error: state?.error, busy, errors, change };
}
export function MemberLicenceCheckbox({ id, name, licences }: { id: string; name: string; licences: ReturnType<typeof useMemberLicences> }) {
 const row = licences.rows[id];
 return <div className="mt-2 text-xs" onClick={e => e.stopPropagation()}>
  <label className="inline-flex cursor-pointer items-center gap-2 text-zinc-200">
   <input type="checkbox" checked={row?.taken ?? false} disabled={!licences.ready || licences.busy[id]}
    aria-label={`Licence prise pour ${name}`} onChange={e => void licences.change(id, e.target.checked)} />
   {licences.busy[id] ? 'Enregistrement…' : row?.taken ? 'Licence prise' : 'Licence à prendre'}
  </label>
  {row?.taken_at && <p className="mt-1 text-emerald-300">Notée le {new Date(row.taken_at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}</p>}
  {(licences.errors[id] || licences.error) && <p role="alert" className="text-amber-200">{licences.errors[id] || licences.error}</p>}
 </div>;
}
