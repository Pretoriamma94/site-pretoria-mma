import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import { AdminCreatePostForm } from '../AdminCreatePostForm';
import { setPostPublishStateAction } from '../actions';
import { DeletePostButton } from './DeletePostButton';

type SearchParams = Promise<{ created?: string; photos?: string }>;

export default async function AdminActualitesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const justCreated = params.created === '1';

  const supabase = createServerClient();
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, titre, slug, categorie, publie, date_publication, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white">
        Actualités
      </h1>
      <p className="mt-3 text-sm text-zinc-300">
        Création, modification, publication et suivi des articles du club.
      </p>

      {justCreated ? (
        <p className="mt-6 rounded-xl border border-green-900/50 bg-green-950/40 px-4 py-3 text-sm text-green-300">
          Actualité créée avec succès
          {params.photos === '1' ? ' (avec photo).' : '.'} Elle apparaît dans la liste
          ci-dessous.
        </p>
      ) : null}

      {postsError ? (
        <p className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Impossible de charger les actualités : {postsError.message}
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
          Créer une actualité
        </h2>
        <AdminCreatePostForm />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800 text-sm text-zinc-200">
          <thead className="bg-zinc-950/70 text-left text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Publication</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Lien</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {(posts ?? []).length > 0 ? (
              (posts ?? []).map((post) => (
                <tr key={post.id} className="bg-zinc-950/30">
                  <td className="px-4 py-3 font-medium">{post.titre}</td>
                  <td className="px-4 py-3 text-zinc-300">{post.categorie}</td>
                  <td className="px-4 py-3">
                    {post.publie ? (
                      <span className="rounded bg-green-500/15 px-2 py-1 text-xs text-green-400">
                        Publié
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-700/40 px-2 py-1 text-xs text-zinc-300">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {post.image_url ? (
                      <span className="text-xs text-zinc-300">Oui</span>
                    ) : (
                      <span className="text-xs text-zinc-500">Non</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/actualites/${post.slug}`}
                      className="text-xs font-semibold uppercase tracking-wide text-mma-red hover:underline"
                    >
                      Voir
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/actualites/${post.id}`}
                        className="rounded-full border border-zinc-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-mma-red hover:text-white"
                      >
                        Modifier
                      </Link>
                      <form action={setPostPublishStateAction}>
                        <input type="hidden" name="post_id" value={post.id} />
                        <input
                          type="hidden"
                          name="publish"
                          value={post.publie ? 'false' : 'true'}
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-zinc-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-zinc-400"
                        >
                          {post.publie ? 'Dépublier' : 'Publier'}
                        </button>
                      </form>
                      <DeletePostButton postId={post.id} titre={post.titre} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-4 text-zinc-400" colSpan={6}>
                  Aucun article pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
