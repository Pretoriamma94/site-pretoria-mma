'use client';

import { useRef, useState } from 'react';
import {
  getInscriptionDocumentUrlAction,
  uploadAdminInscriptionDocumentAction,
} from './actions';

type DocKind = 'certificat' | 'photo' | 'questionnaire';

type DocSlot = {
  kind: DocKind;
  label: string;
  path: string | null | undefined;
};

type UploadResultFields = {
  status?: string;
  certificat_medical_url: string | null;
  photo_url: string | null;
  questionnaire_sante_url?: string | null;
  questionnaire_sante?: unknown;
  certificat_engagement_3_semaines: boolean;
  photo_engagement_3_semaines: boolean;
  atteste_certificat: boolean;
};

type Props = {
  inscriptionId: string;
  documents: DocSlot[];
  onUploaded: (fields: UploadResultFields) => void;
};

export function InscriptionDocumentDownloads({
  inscriptionId,
  documents,
  onUploaded,
}: Props) {
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<DocKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRefs = useRef<Record<DocKind, HTMLInputElement | null>>({
    certificat: null,
    photo: null,
    questionnaire: null,
  });

  const openDocument = async (label: string, path: string) => {
    setError(null);
    setMessage(null);
    setLoadingLabel(label);
    try {
      const result = await getInscriptionDocumentUrlAction(path);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Impossible d’ouvrir le document.');
    } finally {
      setLoadingLabel(null);
    }
  };

  const uploadDocument = async (kind: DocKind, file: File) => {
    setError(null);
    setMessage(null);
    setUploadingKind(kind);
    try {
      const formData = new FormData();
      formData.set('inscription_id', inscriptionId);
      formData.set('kind', kind);
      formData.set('file', file);
      const result = await uploadAdminInscriptionDocumentAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onUploaded({
        status: result.status,
        certificat_medical_url: result.certificat_medical_url,
        photo_url: result.photo_url,
        questionnaire_sante_url: result.questionnaire_sante_url,
        questionnaire_sante: result.questionnaire_sante,
        certificat_engagement_3_semaines: result.certificat_engagement_3_semaines,
        photo_engagement_3_semaines: result.photo_engagement_3_semaines,
        atteste_certificat: result.atteste_certificat,
      });
      setMessage(`${documents.find((d) => d.kind === kind)?.label ?? 'Document'} enregistré.`);
    } catch {
      setError('Upload impossible. Réessayez.');
    } finally {
      setUploadingKind(null);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <p className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
        Documents (en ligne + papier scanné) — même stockage Supabase
      </p>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.kind}
            className={
              doc.kind === 'questionnaire' && !doc.path
                ? 'space-y-2 rounded-xl border-2 border-red-500 bg-red-950/50 px-3 py-3'
                : 'flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2'
            }
          >
            {doc.kind === 'questionnaire' && !doc.path ? (
              <p className="text-[0.7rem] font-bold uppercase tracking-wide text-red-100">
                Déposer ici le scan du questionnaire de santé (PDF, JPG ou PNG)
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-[9rem] text-[0.7rem] font-semibold text-zinc-200">
              {doc.label}
            </span>
            {doc.path ? (
              <button
                type="button"
                disabled={loadingLabel === doc.label}
                onClick={() => openDocument(doc.label, doc.path!)}
                className="rounded-full border border-zinc-600 px-3 py-1 text-[0.7rem] font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
              >
                {loadingLabel === doc.label ? 'Ouverture…' : 'Voir / Télécharger'}
              </button>
            ) : (
              <span className={doc.kind === 'questionnaire' ? 'text-[0.7rem] font-semibold text-red-300' : 'text-[0.7rem] text-zinc-500'}>
                {doc.kind === 'questionnaire' ? 'Scan manquant' : 'Pas encore de fichier'}
              </span>
            )}
            <input
              ref={(el) => {
                inputRefs.current[doc.kind] = el;
              }}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) void uploadDocument(doc.kind, file);
              }}
            />
            <button
              type="button"
              disabled={uploadingKind === doc.kind}
              onClick={() => inputRefs.current[doc.kind]?.click()}
              className="rounded-full border border-mma-red/70 bg-mma-red/20 px-3 py-1 text-[0.7rem] font-semibold text-red-100 hover:bg-mma-red/30 disabled:opacity-60"
            >
              {uploadingKind === doc.kind
                ? 'Envoi…'
                : doc.path
                  ? 'Remplacer (scan papier)'
                  : doc.kind === 'questionnaire'
                    ? 'Joindre le questionnaire ici'
                    : 'Joindre scan papier'}
            </button>
            </div>
          </div>
        ))}
      </div>
      {message && <p className="text-emerald-300">{message}</p>}
      {error && <p className="text-red-300">{error}</p>}
    </div>
  );
}
