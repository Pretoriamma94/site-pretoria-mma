import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { retrySelectOnMissingColumn } from '@/lib/admin/inscription-fields';
import { DocumentsClient } from './DocumentsClient';

// Page privée (lien personnel) : ne jamais indexer, toujours à jour.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Mes documents — Pretoria MMA',
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MonInscriptionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!UUID_RE.test(token)) {
    notFound();
  }

  const supabase = createServerClient();
  const { data, error } = await retrySelectOnMissingColumn(
    (select) =>
      supabase
        .from('inscriptions')
        .select(select)
        .eq('documents_token', token)
        .maybeSingle() as unknown as Promise<{
        data: {
          prenom: string;
          nom: string;
          certificat_medical_url: string | null;
          photo_url: string | null;
          pass_pa2s?: boolean | null;
          pass_pa2s_preuve_url?: string | null;
        } | null;
        error: { message: string } | null;
      }>,
    'prenom, nom, certificat_medical_url, photo_url, pass_pa2s, pass_pa2s_preuve_url',
  );

  if (error || !data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        Mes documents
      </h1>
      <p className="mt-4 text-sm text-zinc-300 md:text-base">
        Bonjour {data.prenom}, transmettez ici les documents manquants pour finaliser votre
        inscription. Vous pouvez y revenir à tout moment depuis ce lien personnel, y compris
        pour corriger une pièce déjà envoyée.
      </p>

      <DocumentsClient
        token={token}
        certificatRecu={Boolean(data.certificat_medical_url)}
        photoRecue={Boolean(data.photo_url)}
        passPa2sRequis={Boolean(data.pass_pa2s)}
        passPa2sRecu={Boolean(data.pass_pa2s_preuve_url)}
      />
    </div>
  );
}
