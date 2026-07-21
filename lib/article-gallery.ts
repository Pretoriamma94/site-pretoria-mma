import { readdir } from 'node:fs/promises';
import path from 'node:path';

export async function getArticleGalleryImages(slug: string): Promise<string[]> {
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'actualites', slug);

  try {
    const entries = await readdir(galleryDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
      .map((entry) => `/images/actualites/${slug}/${entry.name}`)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
