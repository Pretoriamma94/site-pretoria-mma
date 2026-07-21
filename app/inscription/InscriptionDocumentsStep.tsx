'use client';

import { cn } from '@/lib/utils';

const fileInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white';

type FileBlockProps = {
  title: string;
  hint: string;
  accept?: string;
  file: File | null;
  engagement: boolean;
  engagementLabel: string;
  error?: string;
  onFile: (file: File | null) => void;
  onEngagement: (checked: boolean) => void;
};

function FileOrEngagementBlock({
  title,
  hint,
  accept = '.pdf,.jpg,.jpeg,.png',
  file,
  engagement,
  engagementLabel,
  error,
  onFile,
  onEngagement,
}: FileBlockProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white">{title}</label>
      <p className="mb-2 text-xs text-zinc-400">{hint}</p>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > 5 * 1024 * 1024) return;
          onFile(f);
        }}
        className={fileInputClass}
      />
      {file && (
        <p className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
          ✅ {file.name}
          <button
            type="button"
            onClick={() => onFile(null)}
            className="text-red-400 hover:underline"
          >
            Supprimer
          </button>
        </p>
      )}
      {!file && (
        <label className="mt-3 flex items-start gap-2">
          <input
            type="checkbox"
            checked={engagement}
            onChange={(e) => onEngagement(e.target.checked)}
            className="mt-1 rounded text-red-600"
          />
          <span className="text-sm text-zinc-300">{engagementLabel}</span>
        </label>
      )}
      {error && <p className={cn('mt-2 text-sm text-red-400')}>{error}</p>}
    </div>
  );
}

type Props = {
  certificatFile: File | null;
  photoFile: File | null;
  engagementCertificat: boolean;
  engagementPhoto: boolean;
  errors: {
    engagementCertificat?: string;
    engagementPhoto?: string;
  };
  onCertificatFile: (file: File | null) => void;
  onPhotoFile: (file: File | null) => void;
  onEngagementCertificat: (v: boolean) => void;
  onEngagementPhoto: (v: boolean) => void;
};

export function InscriptionDocumentsStep({
  certificatFile,
  photoFile,
  engagementCertificat,
  engagementPhoto,
  errors,
  onCertificatFile,
  onPhotoFile,
  onEngagementCertificat,
  onEngagementPhoto,
}: Props) {
  return (
    <>
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
        Étape 4/5 — Documents
      </h2>
      <p className="text-sm text-zinc-400">
        Joignez les fichiers (PDF, JPG ou PNG, max 5 Mo), ou engagez-vous à les transmettre sous 3
        semaines pour finaliser l&apos;inscription.
      </p>
      <div className="mt-6 space-y-6">
        <FileOrEngagementBlock
          title="Certificat médical de moins de 3 mois"
          hint="Atteste l'absence de contre-indication à la pratique du MMA/JJB."
          file={certificatFile}
          engagement={engagementCertificat}
          engagementLabel="Je m'engage à fournir mon certificat médical à jour dans les 3 semaines suivant l'inscription pour la finaliser *"
          error={errors.engagementCertificat}
          onFile={onCertificatFile}
          onEngagement={onEngagementCertificat}
        />

        <FileOrEngagementBlock
          title="Photo d'identité de l'adhérent"
          hint="Photo récente, format JPG ou PNG (PDF accepté si besoin), max 5 Mo."
          accept=".jpg,.jpeg,.png,.pdf"
          file={photoFile}
          engagement={engagementPhoto}
          engagementLabel="Je m'engage à fournir une photo d'identité dans les 3 semaines maximum suivantes *"
          error={errors.engagementPhoto}
          onFile={onPhotoFile}
          onEngagement={onEngagementPhoto}
        />
      </div>
    </>
  );
}
