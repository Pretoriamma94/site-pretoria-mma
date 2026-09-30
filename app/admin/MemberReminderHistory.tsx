'use client';

import { useEffect, useState } from 'react';
import { listMemberReminders } from './member-followup-actions';

type Result = Awaited<ReturnType<typeof listMemberReminders>>;
export function MemberReminderHistory({ id, refresh }: { id: string; refresh: number }) {
  const [result, setResult] = useState<Result | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    listMemberReminders(id).then(value => { if (active) setResult(value); })
      .catch(() => { if (active) setResult({ success: false, error: 'Impossible de charger l’historique.' }); });
    return () => { active = false; };
  }, [id, refresh, retry]);
  const date = (value: string) => new Date(value).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' });
  const sent = result?.success ? result.rows.filter(r => r.status === 'sent') : [];
  const latest = [...sent].sort((a, b) => (b.sent_at ?? b.declared_on ?? '').localeCompare(a.sent_at ?? a.declared_on ?? ''))[0];
  return <div className="space-y-2 rounded-lg border border-zinc-700 p-3">
    <div className="flex justify-between gap-2"><h4 className="font-semibold">Historique des relances</h4>
      <button type="button" className="text-xs underline" onClick={() => { setResult(null); setRetry(n => n + 1); }}>Actualiser</button></div>
    {!result ? <p role="status">Chargement…</p> : !result.success ? <p role="alert" className="text-amber-200">{result.error}</p> : <>
      <p className="text-sm">{sent.length} relance(s) envoyée(s) : {sent.filter(r => r.kind === 'documents').length} documents · {sent.filter(r => r.kind === 'payment').length} cotisation</p>
      {latest && <p className="text-sm">Dernière relance : {latest.source === 'manual' && latest.declared_on ? latest.declared_on.split('-').reverse().join('/') : date(latest.sent_at!)}{latest.source === 'manual' ? ' (déclarée par le club)' : ''}</p>}
      {result.rows.length === 0 && <p className="text-sm text-zinc-400">Aucune relance enregistrée dans cet historique.</p>}
      <div className="max-h-80 space-y-2 overflow-y-auto">{result.rows.map(row => <details key={row.id} className="rounded border border-zinc-700 p-2 text-sm">
        <summary className="cursor-pointer">{row.source === 'manual' && row.declared_on ? row.declared_on.split('-').reverse().join('/') : date(row.sent_at ?? row.created_at)} — {row.kind === 'documents' ? 'Documents' : 'Cotisation'} — {row.source === 'manual' ? 'Déclarée par le club' : row.status === 'sent' ? 'Envoyée' : row.status === 'failed' ? 'Échec' : 'Envoi non confirmé'}</summary>
        <p className="mt-2">À : {row.recipient || 'Non enregistré'}<br />Copie : {row.cc || 'Non enregistrée'}</p>
        {row.status === 'pending' && <p className="text-amber-200">Vérifiez votre copie email avant de relancer à nouveau.</p>}
        <p className="mt-2 font-semibold">{row.subject}</p><p className="whitespace-pre-wrap">{row.body}</p>
      </details>)}</div>
    </>}
    <p className="text-xs text-zinc-400">Les anciennes relances ne sont comptabilisées que si elles ont été déclarées par le club. « Envoyée » signifie acceptée par le service email, sans garantie de lecture.</p>
  </div>;
}
