import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const categorieLabels: Record<string, string> = {
  evenement: 'Événement',
  competition: 'Compétition',
  vie_du_club: 'Vie du club',
  conseils: 'Conseils',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface PostCardProps {
  titre: string;
  slug: string;
  resume: string | null;
  date_publication: string | null;
  categorie: string;
  image_url?: string | null;
}

export function PostCard({
  titre,
  slug,
  resume,
  date_publication,
  categorie,
  image_url,
}: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      {image_url ? (
        <Link href={`/actualites/${slug}`} className="block">
          <img
            src={image_url}
            alt={titre}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </Link>
      ) : null}
      <CardHeader>
        <Link href={`/actualites/${slug}`}>
          <CardTitle className="transition-colors hover:text-mma-red">{titre}</CardTitle>
        </Link>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-400">{formatDate(date_publication)}</span>
          <span className="rounded bg-mma-red/20 px-2 py-0.5 text-xs font-medium text-mma-red">
            {categorieLabels[categorie] ?? categorie}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resume && <p className="text-sm text-zinc-300">{resume}</p>}
        <Link
          href={`/actualites/${slug}`}
          className="mt-3 inline-flex text-xs font-semibold uppercase tracking-wide text-zinc-300 transition-colors hover:text-mma-red"
        >
          Lire l&apos;article
        </Link>
      </CardContent>
    </Card>
  );
}
