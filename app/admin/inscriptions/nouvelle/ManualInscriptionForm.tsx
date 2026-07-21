'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isMinor, montantParEcheance } from '@/lib/inscription/schema';
import { defaultMontantForCours } from '@/lib/admin/manual-inscription-schema';
import { createManualInscriptionAction } from '../../actions';
import {
  MANUAL_FORM_INITIAL,
  type ManualFormState,
} from './manual-form-state';
import {
  ManualAdherentSection,
  ManualDocsSection,
  ManualPaymentSection,
} from './ManualInscriptionSections';

export function ManualInscriptionForm() {
  const router = useRouter();
  const [form, setForm] = useState<ManualFormState>(MANUAL_FORM_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showResponsable = form.dateNaissance ? isMinor(form.dateNaissance) : false;
  const total = Number(form.montantTotal.replace(',', '.')) || 0;
  const paye = Number(form.montantPaye.replace(',', '.')) || 0;
  const parEcheance = total > 0 ? montantParEcheance(total, form.nombreEcheances) : null;

  const previewStatus = useMemo(() => {
    if (total <= 0) return '—';
    return paye >= total ? 'Payée' : 'En attente de paiement';
  }, [paye, total]);

  const setField = <K extends keyof ManualFormState>(key: K, value: ManualFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCoursChange = (coursId: ManualFormState['cours']) => {
    setForm((prev) => ({
      ...prev,
      cours: coursId,
      montantTotal: coursId ? String(defaultMontantForCours(coursId)) : prev.montantTotal,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await createManualInscriptionAction({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        dateNaissance: form.dateNaissance,
        numeroVoie: form.numeroVoie,
        rue: form.rue,
        codePostal: form.codePostal,
        ville: form.ville,
        tailleCm: form.tailleCm,
        poidsKg: form.poidsKg,
        tailleTenue: form.tailleTenue || undefined,
        cours: form.cours || undefined,
        montantTotal: Number(form.montantTotal.replace(',', '.')),
        modePaiement: form.modePaiement,
        nombreEcheances: form.nombreEcheances,
        montantPaye: Number(form.montantPaye.replace(',', '.')),
        accepteReglement: form.accepteReglement,
        attesteCertificat: form.attesteCertificat,
        photoRecue: form.photoRecue,
        engagementPhoto: form.engagementPhoto,
        engagementCertificat: form.engagementCertificat,
        autorisePhotos: form.autorisePhotos,
        informeAssurance: form.informeAssurance,
        informeDroitAcces: form.informeDroitAcces,
        autoriseSortieSeul: form.autoriseSortieSeul ?? undefined,
        autoriseVoiturePrivee: form.autoriseVoiturePrivee ?? undefined,
        autorisePhotosMineur: form.autorisePhotosMineur ?? undefined,
        nomResponsable: form.nomResponsable || undefined,
        prenomResponsable: form.prenomResponsable || undefined,
        telephoneResponsable: form.telephoneResponsable || undefined,
        emailResponsable: form.emailResponsable || undefined,
        lienParente: form.lienParente || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push('/admin/inscriptions');
      router.refresh();
    } catch {
      setError('Erreur inattendue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <ManualAdherentSection
        form={form}
        setField={setField}
        showResponsable={showResponsable}
      />
      <ManualPaymentSection
        form={form}
        setField={setField}
        onCoursChange={onCoursChange}
        parEcheance={parEcheance}
        previewStatus={previewStatus}
        total={total}
        paye={paye}
      />
      <ManualDocsSection
        form={form}
        setField={setField}
        showResponsable={showResponsable}
      />

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/inscriptions"
          className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 hover:border-zinc-400"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-mma-red px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white disabled:opacity-60"
        >
          {loading ? 'Enregistrement…' : "Enregistrer l'inscription"}
        </button>
      </div>
    </form>
  );
}
