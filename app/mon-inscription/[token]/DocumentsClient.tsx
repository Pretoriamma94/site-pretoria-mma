'use client';

import { useState } from 'react';
import Link from 'next/link';
import { uploadInscriptionFile } from '@/lib/inscription/upload';
import { submitInscriptionDocumentAction } from '../actions';
import { cn } from '@/lib/utils';

type DocKind = 'certificat' | 'photo';

type Props = {
  token: string;
  certificatRecu: boolean;
  photoRecue: boolean;
};

const DOC_META: Record<
  DocKind,
  { label: string; hint: string; accept: string }
> = {
  certificat: {
    label: 'Certificat médical (moins de 3 mois)',
    hint: 'Atteste l\u2019absence de contre-indication à la pratique du MMA / JJB. PDF, JPG ou PNG — max 5 Mo.',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  photo: {
    label: 'Photo d\u2019identité',
    hint: 'Photo récente de l\u2019adhérent. JPG, PNG (PDF accepté) — max 5 Mo.',
    accept: '.jpg,.jpeg,.png,.pdf',
  },
};

export function DocumentsClient({ token, certificatRecu, photoRecue }: Props) {
  const [recu, setRecu] = useState<Record<DocKind, boolean>>({
    certificat: certificatRecu,
    photo: photoRecue,
  });
  const [files, setFiles] = useState<Record<DocKind, File | null>>({
    certificat: null,
    photo: null,
  });
  const [busy, setBusy] = useState<DocKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalized, setFinalized] = useState(false);
  const [editing, setEditing] = useState<Record<DocKind, boolean>>({
    certificat: false,
    photo: false,
  });

  const allDone = recu.certificat && recu.photo;

  const handleSubmit = async (kind: DocKind) => {
    const file = files[kind];
    if (!file) return;
    setError(null);
    setBusy(kind);
    try {
      const uploaded = await uploadInscriptionFile(file, kind);
      if ('error' in uploaded) {
        setError(uploaded.error);
        return;
      }
      const result = await submitInscriptionDocumentAction({
        token,
        kind,
        path: uploaded.path,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRecu({ certificat: result.certificatRecu, photo: result.photoRecue });
      setFiles((prev) => ({ ...prev, [kind]: null }));
      setEditing((prev) => ({ ...prev, [kind]: false }));
      setFinalized(result.finalized);
    } catch {
      setError('Une erreur est survenue. Merci de réessayer.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {allDone ? (
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-5 text-sm text-emerald-200">
          <p className="text-base font-semibold">Tous vos documents sont transmis ✅</p>
          <p className="mt-1 text-emerald-300/90">
            {finalized
              ? 'Votre dossier est complet. Merci !'
              : 'Merci ! Le club finalisera votre dossier après réception du paiement.'}
          </p>
          <p className="mt-2 text-emerald-300/80">
            Une erreur dans un document ? Vous pouvez le corriger ci-dessous, il
            remplacera la pièce déjà envoyée.
          </p>
        </div>
      ) : null}

      {(['certificat', 'photo'] as const).map((kind) => {
        const meta = DOC_META[kind];
        const done = recu[kind];
        const isEditing = editing[kind];
        const file = files[kind];
        return (
          <div
            key={kind}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">{meta.label}</h2>
                <p className="mt-1 text-xs text-zinc-400">{meta.hint}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-[0.7rem] font-semibold',
                  done
                    ? 'border-emerald-700/70 bg-emerald-900/40 text-emerald-200'
                    : 'border-amber-700/70 bg-amber-900/40 text-amber-200',
                )}
              >
                {done ? 'Transmis' : 'À fournir'}
              </span>
            </div>

            {done && !isEditing ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm text-emerald-300">Document bien reçu. Merci !</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setEditing((prev) => ({ ...prev, [kind]: true }));
                  }}
                  className="inline-flex rounded-full border border-zinc-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-400 hover:bg-zinc-800"
                >
                  Corriger / remplacer
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {done ? (
                  <p className="text-xs text-amber-300">
                    Le nouveau fichier remplacera le document déjà transmis.
                  </p>
                ) : null}
                <input
                  type="file"
                  accept={meta.accept}
                  disabled={busy === kind}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.size > 5 * 1024 * 1024) {
                      setError('Fichier trop volumineux (max 5 Mo).');
                      return;
                    }
                    setError(null);
                    setFiles((prev) => ({ ...prev, [kind]: f }));
                  }}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!file || busy === kind}
                    onClick={() => handleSubmit(kind)}
                    className="inline-flex rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {busy === kind
                      ? 'Envoi…'
                      : done
                        ? 'Remplacer ce document'
                        : 'Envoyer ce document'}
                  </button>
                  {done ? (
                    <button
                      type="button"
                      disabled={busy === kind}
                      onClick={() => {
                        setFiles((prev) => ({ ...prev, [kind]: null }));
                        setEditing((prev) => ({ ...prev, [kind]: false }));
                        setError(null);
                      }}
                      className="inline-flex rounded-full border border-zinc-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-400 hover:bg-zinc-800 disabled:opacity-60"
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {error ? (
        <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="pt-2">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-300 hover:text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
