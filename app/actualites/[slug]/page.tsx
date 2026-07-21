import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getArticleGalleryImages } from '@/lib/article-gallery';
import { ClubGalleryCarousel } from '@/components/ClubGalleryCarousel';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date à venir';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = createServerClient();
  const galleryImages = await getArticleGalleryImages(slug);
  const { data: post } = await supabase
    .from('posts')
    .select('titre, resume, contenu, date_publication, categorie, image_url, galerie_urls')
    .eq('slug', slug)
    .eq('publie', true)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  const uploadedGallery = Array.isArray(post.galerie_urls) ? post.galerie_urls : [];
  const allGallery = Array.from(new Set([...uploadedGallery, ...galleryImages]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link
        href="/actualites"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-300 transition hover:text-mma-red"
      >
        ← Retour aux actualités
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.25em] text-primary">Actualité du club</p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
        {post.titre}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span>{formatDate(post.date_publication)}</span>
        <span className="rounded bg-mma-red/20 px-2 py-0.5 font-medium text-mma-red">
          {post.categorie}
        </span>
      </div>
      {post.image_url ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.titre}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : allGallery.length > 0 ? (
        <div className="mt-6">
          <ClubGalleryCarousel images={allGallery} />
        </div>
      ) : null}
      {post.resume ? <p className="mt-6 text-base text-zinc-200">{post.resume}</p> : null}
      <article className="mt-6 whitespace-pre-line text-sm leading-relaxed text-zinc-300 md:text-base">
        {post.contenu}
      </article>
      {post.image_url && allGallery.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-lg uppercase tracking-[0.2em] text-white">
            Galerie photos
          </h2>
          <ClubGalleryCarousel images={allGallery} />
        </section>
      ) : null}

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <Link
          href="/actualites"
          className="inline-flex rounded-full border border-zinc-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-mma-red hover:text-white"
        >
          ← Retour aux actualités
        </Link>
      </div>
    </div>
  );
}
