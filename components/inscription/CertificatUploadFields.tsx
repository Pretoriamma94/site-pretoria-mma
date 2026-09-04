'use client';

import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { TEXTE_ENGAGEMENT_CERTIFICAT_MMA } from '@/lib/inscription/questionnaire-sante';

const fileInputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white';

type Props = {
  file: File | null;
  engagement: boolean;
  error?: string;
  warning?: boolean;
  onFile: (file: File | null) => void;
  onEngagement: (v: boolean) => void;
};

export function CertificatUploadFields({
  file,
  engagement,
  error,
  warning,
  onFile,
  onEngagement,
}: Props) {
  return (
    <div className="space-y-3">
      {warning ? (
        <p className="rounded-xl border border-amber-700/70 bg-amber-950/40 p-3 text-sm text-amber-100">
          Une réponse OUI au questionnaire impose un certificat médical. Sans fichier, cochez
          l’engagement ci-dessous pour poursuivre l’inscription.
        </p>
      ) : (
        <p className="text-xs text-zinc-400">
          Si vous n’avez pas le certificat aujourd’hui, vous pouvez poursuivre en vous engageant à
          le fournir sous 3 semaines.
        </p>
      )}
      <label className="mb-1 block text-sm font-medium text-white">Certificat médical</label>
      <p className="text-xs text-zinc-500">PDF, JPG ou PNG — max 5 Mo.</p>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className={fileInputClass}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > 5 * 1024 * 1024) return;
          onFile(f);
          if (f) onEngagement(false);
        }}
      />
      {file ? (
        <p className="text-sm text-zinc-300">
          {file.name}{' '}
          <button type="button" className="text-red-400 hover:underline" onClick={() => onFile(null)}>
            Supprimer
          </button>
        </p>
      ) : (
        <ConsentCheckbox id="engagementCertificat" checked={engagement} onChange={onEngagement} error={error}>
          {TEXTE_ENGAGEMENT_CERTIFICAT_MMA} *
        </ConsentCheckbox>
      )}
      {error && file ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
