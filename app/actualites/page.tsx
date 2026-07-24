import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/PostCard';

async function getPosts() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('posts')
      .select('id, slug, titre, resume, date_publication, categorie, image_url')
      .eq('publie', true)
      .order('date_publication', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[actualites] lecture posts échouée', error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error('[actualites] Supabase indisponible', err);
    return [];
  }
}

export default async function ActualitesPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
            Actualités
          </h1>
          <p className="mt-2 text-sm text-zinc-300 md:text-base">
            Suivez la vie du club, les compétitions et les évènements.
          </p>
        </div>
        <div className="text-xs text-zinc-400">
          {/* Placeholder pour les filtres par catégorie */}
          <p>Filtres par catégorie à venir (évènement, compétition, vie du club, conseils).</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              titre={post.titre}
              slug={post.slug}
              resume={post.resume}
              date_publication={post.date_publication}
              categorie={post.categorie}
              image_url={post.image_url}
            />
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aucune actualité publiée</CardTitle>
              <p className="text-sm text-zinc-400">
                Ajoute un article depuis Supabase pour l&apos;afficher ici.
              </p>
              <Link
                href="/admin"
                className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wide text-zinc-300 transition-colors hover:text-mma-red"
              >
                Ouvrir l&apos;admin
              </Link>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* TODO: pagination Supabase */}
      <div className="mt-8 text-center text-xs text-zinc-500">Pagination à venir.</div>
    </div>
  );
}