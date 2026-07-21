import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import type { ContactMessage } from '@/types/database';
import { ContactInbox } from './ContactInbox';

type SearchParams = Promise<{ filtre?: string }>;

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const raw = params.filtre ?? 'open';
  const filter: 'open' | 'done' | 'all' =
    raw === 'done' || raw === 'all' ? raw : 'open';

  const supabase = createServerClient();
  let builder = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter === 'open') builder = builder.eq('traite', false);
  if (filter === 'done') builder = builder.eq('traite', true);

  const { data, error } = await builder;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
        Messages de contact
      </h1>
      <p className="mt-3 text-sm text-zinc-300">
        Messages reçus via le formulaire du site.
      </p>
      {error ? (
        <p className="mt-6 text-sm text-red-400">Erreur : {error.message}</p>
      ) : (
        <ContactInbox
          key={filter}
          initialMessages={(data ?? []) as ContactMessage[]}
          filter={filter}
        />
      )}
    </div>
  );
}
