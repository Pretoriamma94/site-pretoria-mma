'use client';

import { cn } from '@/lib/utils';
import {
  TEXTE_CERTIFICAT_MEDICAL_OBLIGATOIRE,
  TEXTE_ENGAGEMENT_CERTIFICAT,
  TEXTE_ENGAGEMENT_PHOTO,
  TEXTE_RISQUES_SPORTS_COMBAT,
} from '@/lib/inscription/legal-texts';

const fileInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white';

type Props = {
  certificatFile: File | null;
  photoFile: File | null;
  engagementCertificat: boolean;
  engagementPhoto: boolean;
  certificatError?: string;
  photoError?: string;
  onCertificatFile: (file: File | null) => void;
  onPhotoFile: (file: File | null) => void;
  onEngagementCertificat: (checked: boolean) => void;
  onEngagementPhoto: (checked: boolean) => void;
};

export function InscriptionSanteStep({
  certificatFile,
  photoFile,
  engagementCertificat,
  engagementPhoto,
  certificatError,
  photoError,
  onCertificatFile,
  onPhotoFile,
  onEngagementCertificat,
  onEngagementPhoto,
}: Props) {
  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Santé / sport
      </h2>
      <p className="mt-2 rounded-xl border border-amber-800/50 bg-amber-950/30 p-4 text-sm text-amber-100">
        {TEXTE_RISQUES_SPORTS_COMBAT}
      </p>
      <p className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4 text-sm text-zinc-200">
        {TEXTE_CERTIFICAT_MEDICAL_OBLIGATOIRE}
      </p>
      <p className="mt-4 text-sm text-zinc-400">
        Sans document le jour de l&apos;inscription, cochez l&apos;engagement correspondant : vous
        pourrez poursuivre, et le dossier sera à compléter sous 3 semaines pour validation
        définitive.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Certificat médical *
          </label>
          <p className="mb-2 text-xs text-zinc-500">
            Moins de 3 mois — aptitude JJB / MMA — PDF, JPG ou PNG (max 5 Mo). Non bloquant si
            engagement coché.
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) return;
              onCertificatFile(f);
              if (f) onEngagementCertificat(false);
            }}
            className={fileInputClass}
          />
          {certificatFile && (
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
              {certificatFile.name}
              <button
                type="button"
                onClick={() => onCertificatFile(null)}
                className="text-red-400 hover:underline"
              >
                Supprimer
              </button>
            </p>
          )}
          {!certificatFile && (
            <label className="mt-3 flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
              <input
                type="checkbox"
                checked={engagementCertificat}
                onChange={(e) => onEngagementCertificat(e.target.checked)}
                className="mt-1 rounded text-red-600"
              />
              <span className="text-sm text-zinc-300">{TEXTE_ENGAGEMENT_CERTIFICAT} *</span>
            </label>
          )}
          {certificatError && <p className="mt-2 text-sm text-red-400">{certificatError}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Photo d&apos;identité
          </label>
          <p className="mb-2 text-xs text-zinc-500">
            Photo récente pour la licence et le dossier adhérent. Non bloquante : vous pouvez
            continuer sans fichier en cochant l&apos;engagement ci-dessous.
          </p>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) return;
              onPhotoFile(f);
              if (f) onEngagementPhoto(false);
            }}
            className={fileInputClass}
          />
          {photoFile && (
            <p className={cn('mt-2 text-sm text-zinc-300')}>
              {photoFile.name}
              <button
                type="button"
                onClick={() => onPhotoFile(null)}
                className="ml-2 text-red-400 hover:underline"
              >
                Supprimer
              </button>
            </p>
          )}
          {!photoFile && (
            <label className="mt-3 flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
              <input
                type="checkbox"
                checked={engagementPhoto}
                onChange={(e) => onEngagementPhoto(e.target.checked)}
                className="mt-1 rounded text-red-600"
              />
              <span className="text-sm text-zinc-300">{TEXTE_ENGAGEMENT_PHOTO} *</span>
            </label>
          )}
          {photoError && <p className="mt-2 text-sm text-red-400">{photoError}</p>}
        </div>
      </div>
    </>
  );
}
