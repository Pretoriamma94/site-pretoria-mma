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
  ManualCoursSection,
  ManualPaymentSection,
} from './ManualInscriptionSections';
import {
  ManualAutorisationsSection,
  ManualCharteSection,
  ManualInfosSection,
  ManualRgpdSection,
} from './ManualConsentSections';
import { ManualSantePhotoSection } from './ManualSantePhotoSection';

export function ManualInscriptionForm() {
  const router = useRouter();
  const [form, setForm] = useState<ManualFormState>(MANUAL_FORM_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isBaby = form.cours === 'baby';
  const isMineur = isBaby || (form.dateNaissance ? isMinor(form.dateNaissance) : false);
  const isMmaMineur = !isBaby && isMineur;
  const total = Number(form.montantTotal.replace(',', '.')) || 0;
  const paye = Number(form.montantPaye.replace(',', '.')) || 0;
  const parEcheance = total > 0 ? montantParEcheance(total, form.nombreEcheances) : null;
  const representantLegal = isBaby
    ? [
        [form.prenomPere, form.nomPere].filter(Boolean).join(' '),
        [form.prenomMere, form.nomMere].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(' / ')
    : [form.prenomResponsable, form.nomResponsable].filter(Boolean).join(' ');

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
      certificatMoinsDe3Ans: coursId === 'baby' ? null : prev.certificatMoinsDe3Ans,
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
        sexe: form.sexe || null,
        email: form.email,
        telephone: form.telephone,
        dateNaissance: form.dateNaissance,
        adresse: form.adresse,
        codePostal: form.codePostal,
        ville: form.ville,
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
        acceptePhotos: form.acceptePhotos,
        informeAssurance: form.informeAssurance,
        informeDroitAcces: form.informeDroitAcces,
        accepteRgpd: form.accepteRgpd,
        charteLue: form.charteLue,
        charteReglesConnues: form.charteReglesConnues,
        charteEngagementRespect: form.charteEngagementRespect,
        parcoursSante: form.parcoursSante || null,
        certificatMoinsDe3Ans: form.certificatMoinsDe3Ans,
        attestationResultat: form.attestationResultat || null,
        autoriseSortieSeul: form.autoriseSortieSeul ?? undefined,
        autoriseVoiturePrivee: form.autoriseVoiturePrivee ?? undefined,
        nomResponsable: form.nomResponsable || undefined,
        prenomResponsable: form.prenomResponsable || undefined,
        nomPere: form.nomPere || undefined,
        prenomPere: form.prenomPere || undefined,
        telephonePere: form.telephonePere || undefined,
        nomMere: form.nomMere || undefined,
        prenomMere: form.prenomMere || undefined,
        telephoneMere: form.telephoneMere || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const emailCible = form.email.trim().toLowerCase();
      if (result.emailSent) {
        setNotice(
          `Inscription créée. Email de confirmation envoyé à ${emailCible} (identique à l’inscription en ligne).`,
        );
        setTimeout(() => {
          router.push('/admin/inscriptions');
          router.refresh();
        }, 1800);
      } else {
        setNotice(
          `Inscription créée, mais l’email n’a pas pu être envoyé${
            result.emailError ? ` (${result.emailError})` : ''
          }. Vous pourrez le renvoyer depuis la fiche adhérent.`,
        );
      }
    } catch {
      setError('Erreur inattendue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <ManualCoursSection form={form} onCoursChange={onCoursChange} />
      <ManualAdherentSection
        form={form}
        setField={setField}
        isBaby={isBaby}
        isMmaMineur={isMmaMineur}
      />
      <ManualInfosSection form={form} setField={setField} />
      <ManualAutorisationsSection
        form={form}
        setField={setField}
        isBaby={isBaby}
        isMineur={isMineur}
        representantLegal={representantLegal}
      />
      <ManualSantePhotoSection form={form} setField={setField} isBaby={isBaby} />
      <ManualRgpdSection form={form} setField={setField} />
      <ManualCharteSection form={form} setField={setField} />
      <ManualPaymentSection
        form={form}
        setField={setField}
        parEcheance={parEcheance}
        previewStatus={previewStatus}
        total={total}
        paye={paye}
      />

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {notice && (
        <p className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
          {notice}
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
