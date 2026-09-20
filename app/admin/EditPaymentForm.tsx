'use client';

import { useState } from 'react';
import type { InscriptionPaiementRow } from './actions';
import { editPaymentAction } from './payment-edit-actions';

export function EditPaymentForm({ payment, onCancel }: { payment: InscriptionPaiementRow; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'mt-1 block w-full rounded border border-zinc-600 bg-zinc-950 p-2 text-white';
  return <form className="w-full space-y-3 border-t border-zinc-700 pt-3" onSubmit={async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const expected = { montant: Number(payment.montant), mode_paiement: payment.mode_paiement, date_reception: payment.date_reception, numero_echeance: payment.numero_echeance, note: payment.note };
      const result = await editPaymentAction(payment.id, expected, {
        montant: Number(String(form.get('montant')).replace(',', '.')),
        mode_paiement: String(form.get('mode')),
        date_reception: String(form.get('date')),
        numero_echeance: form.get('echeance') ? Number(form.get('echeance')) : null,
        note: String(form.get('note') ?? '').trim() || null,
      });
      if (!result.success) { setError(result.error); setBusy(false); return; }
      // Les deux annuaires conservent la fiche et les totaux dans leur état local.
      window.location.reload();
    } catch { setError('Connexion interrompue. Actualisez la fiche pour vérifier le paiement avant de réessayer.'); setBusy(false); }
  }}>
    <p className="font-semibold">Corriger ce paiement</p>
    {payment.legacy && <p className="text-zinc-400">Ce paiement ancien ne comporte pas de détail. La correction créera sa ligne dans l’historique, sans ajouter de nouveau versement au total payé.</p>}
    <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
      <label>Montant reçu (€)<input className={inputClass} name="montant" type="number" min="0.01" max="99999999.99" step="0.01" required defaultValue={payment.montant} /></label>
      <label>Mode de paiement<select className={inputClass} name="mode" defaultValue={payment.mode_paiement}><option value="cash">Espèces</option><option value="cheque">Chèque</option><option value="virement">Virement</option></select></label>
      <label>Date de réception<input className={inputClass} name="date" type="date" required defaultValue={payment.date_reception} /></label>
      <label>Échéance<select className={inputClass} name="echeance" defaultValue={payment.numero_echeance ?? ''}><option value="">Non précisée</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>
      <label className="sm:col-span-2">Note<input className={inputClass} name="note" maxLength={280} defaultValue={payment.note ?? ''} /></label>
    </fieldset>
    <p className="text-zinc-400">Le total payé et le reste dû seront mis à jour. Les reçus déjà envoyés restent inchangés ; vous pourrez envoyer un reçu corrigé séparément.</p>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    <div className="flex gap-2">
      <button type="submit" disabled={busy} className="rounded-full bg-red-700 px-3 py-2 text-white disabled:opacity-50">{busy ? 'Enregistrement…' : 'Enregistrer la correction'}</button>
      <button type="button" disabled={busy} onClick={onCancel} className="rounded-full border border-zinc-600 px-3 py-2">Annuler</button>
    </div>
  </form>;
}
