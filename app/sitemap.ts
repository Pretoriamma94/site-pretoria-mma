import type { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/site-url';

const PUBLIC_PATHS = [
  '',
  '/le-mma',
  '/le-club',
  '/cours',
  '/actualites',
  '/contact',
  '/inscription',
  '/charte',
  '/mentions-legales',
  '/politique-confidentialite',
  '/cookies',
] as const;

async function getPublishedPostEntries(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('posts')
      .select('slug, date_publication, updated_at')
      .eq('publie', true);
    if (error || !data) {
      if (error) console.error('[sitemap] lecture posts échouée', error.message);
      return [];
    }
    return data
      .filter((post) => Boolean(post.slug))
      .map((post) => ({
        url: `${base}/actualites/${post.slug}`,
        lastModified: post.updated_at ?? post.date_publication ?? undefined,
      }));
  } catch (err) {
    console.error('[sitemap] Supabase indisponible', err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: new Date(),
  }));
  const posts = await getPublishedPostEntries(base);
  return [...pages, ...posts];
}
