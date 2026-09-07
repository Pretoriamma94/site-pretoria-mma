import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { retrySelectOnMissingColumn } from '@/lib/admin/inscription-fields';
import { AdminEditPostForm, type EditablePost } from './AdminEditPostForm';

type Params = Promise<{ id: string }>;

const POST_EDIT_SELECT =
  'id, titre, slug, resume, contenu, categorie, publie, image_url, galerie_urls, popup_actif, popup_debut, popup_fin, popup_max_affichages';

export default async function AdminEditActualitePage({
  params,
}: {
  params: Params;
}) {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const supabase = createServerClient();
  const { data: post, error } = await retrySelectOnMissingColumn(
    (select) =>
      supabase.from('posts').select(select).eq('id', id).maybeSingle() as unknown as Promise<{
        data: EditablePost | null;
        error: { message: string } | null;
      }>,
    POST_EDIT_SELECT,
  );

  if (error || !post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link
        href="/admin/actualites"
        className="text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-mma-red"
      >
        ← Retour aux actualités
      </Link>
      <h1 className="mt-4 font-display text-3xl uppercase tracking-[0.2em] text-white">
        Modifier l&apos;actualité
      </h1>
      <p className="mt-2 text-sm text-zinc-300">{post.titre}</p>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
        <AdminEditPostForm post={post} />
      </div>
    </div>
  );
}
