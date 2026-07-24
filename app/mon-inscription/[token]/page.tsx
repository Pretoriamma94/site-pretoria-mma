import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
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
  const { data, error } = await supabase
    .from('inscriptions')
    .select('prenom, nom, certificat_medical_url, photo_url')
    .eq('documents_token', token)
    .maybeSingle();

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
        inscription. Vous pouvez y revenir à tout moment depuis ce lien personnel.
      </p>

      <DocumentsClient
        token={token}
        certificatRecu={Boolean(data.certificat_medical_url)}
        photoRecue={Boolean(data.photo_url)}
      />
    </div>
  );
}
