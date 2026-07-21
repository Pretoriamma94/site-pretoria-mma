import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerClient } from '@/lib/supabase/server';

type CoachCardData = {
  id: string;
  name: string;
  specialities: string;
  diplomas: string;
  bio: string;
  photoUrl: string;
  isFounder: boolean;
};

function detectFounder(name: string, diplomas: string): boolean {
  const haystack = `${name} ${diplomas}`.toLowerCase();
  return haystack.includes('patate') || haystack.includes('fondateur');
}

/** Place le fondateur au centre de la grille (ex. 3 cartes → position du milieu). */
function centerFounder(coaches: CoachCardData[]): CoachCardData[] {
  const index = coaches.findIndex((coach) => coach.isFounder);
  if (index === -1) return coaches;
  const reordered = [...coaches];
  const [founder] = reordered.splice(index, 1);
  reordered.splice(Math.floor(reordered.length / 2), 0, founder);
  return reordered;
}

const fallbackCoaches: CoachCardData[] = [
  {
    id: 'fallback-romain',
    name: 'Romain',
    specialities: 'Grappling',
    diplomas: 'Ceinture violette - FORCE & HONNEUR',
    bio: 'Romain fait partie des tout premiers élèves de Christophe dit Patate en Pancrace. Très tôt, il développe une véritable passion pour les sports de combat et enrichit progressivement sa pratique en se perfectionnant en kick-boxing, avant de se consacrer plus particulièrement au ju-jitsu brésilien, discipline dans laquelle il obtient la ceinture violette. Au fil des années, son sérieux, son engagement et son amour du partage l’amènent naturellement à accompagner Patate dans la transmission des valeurs et des techniques du club. Aujourd’hui, Romain encadre principalement les cours de grappling au sein de Pretoria MMA, où il met son expérience et sa pédagogie au service des pratiquants, dans le respect de l’esprit du club : progression, dépassement de soi et esprit d’équipe.',
    photoUrl: '/images/coachs/romain.jpg',
    isFounder: false,
  },
  {
    id: 'fallback-pacino',
    name: 'Pacino',
    specialities: 'Coach Kick-Boxing / MMA',
    diplomas: 'Coach sportif et ceinture marron',
    bio: 'Pacino fait également partie des tous premiers élèves de Christophe dit Patate. Très tôt passionné par les sports de combat, il s’oriente vers le kick-boxing tout en développant une solide expertise en ju-jitsu brésilien, discipline dans laquelle il obtient la ceinture marron. Aujourd’hui coach sportif, Pacino encadre les entraînements de kick-boxing au sein de Pretoria MMA. Grâce à sa grande expérience du grappling, il adapte son enseignement aux exigences du MMA moderne, permettant aux pratiquants de développer un striking efficace tout en restant connectés aux réalités du combat au sol.',
    photoUrl: '/images/coachs/pacino.jpg',
    isFounder: false,
  },
  {
    id: 'fallback-christophe',
    name: 'Christophe "Patate"',
    specialities: 'Coach MMA / Pancrace',
    diplomas: 'Fondateur du club — Respect, progression et dépassement de soi',
    bio: 'Christophe dit Patate. Passionné de sport de combat depuis toujours et animé par l’envie de transmettre, il commence rapidement à enseigner le pancrace. C’est dans ce cadre que Pacino et Romain font partie de ses premiers élèves. Fort de cette expérience, il crée ensuite son propre club de pancrace qu’il développera pendant plusieurs années. Lorsque le MMA est finalement autorisé et structuré en France, il s’oriente tout naturellement vers cette discipline qui correspond parfaitement à sa vision des sports de combat : un système complet mêlant percussion, lutte et travail au sol. Aujourd’hui à travers Pretoria MMA, Patate continue de transmettre sa passion, son expérience et les valeurs qui font l’identité du club : respect, progression et dépassement de soi.',
    photoUrl: '/images/coachs/christophe.jpg',
    isFounder: true,
  },
];

async function getCoachesFromDb(): Promise<CoachCardData[] | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('coaches')
      .select('id, nom, prenom, bio, photo_url, specialites, diplomes, actif, ordre_affichage')
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (!data || data.length === 0) {
      return null;
    }

    return data.map((coach) => {
      const name = [coach.prenom, coach.nom].filter(Boolean).join(' ') || 'Coach';
      const specialities =
        coach.specialites && coach.specialites.length > 0
          ? coach.specialites.join(', ')
          : 'Spécialités à compléter';
      const diplomas =
        coach.diplomes && coach.diplomes.length > 0
          ? coach.diplomes.join(', ')
          : 'Diplômes à compléter';

      return {
        id: coach.id,
        name,
        specialities,
        diplomas,
        bio: coach.bio || 'À compléter',
        photoUrl: coach.photo_url || '/images/coachs/placeholder.svg',
        isFounder: detectFounder(name, diplomas),
      };
    });
  } catch {
    return null;
  }
}

export async function CoachesSection() {
  const dbCoaches = await getCoachesFromDb();
  const sourceCoaches: CoachCardData[] =
    dbCoaches && dbCoaches.length > 0 ? dbCoaches : fallbackCoaches;
  const coaches = centerFounder(sourceCoaches);

  return (
    <section id="equipe" className="scroll-mt-24 space-y-4">
      <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white md:text-2xl">
        L&apos;équipe pédagogique
      </h2>
      <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
        Découvrez les coachs qui encadrent les cours au sein de Pretoria MMA La Queue-en-Brie.
        Fondé par Christophe &quot;Patate&quot;, le club s&apos;appuie sur une équipe de
        pratiquants expérimentés et diplômés, dont Romain et Pacino, ses tout premiers élèves.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {coaches.map((coach) => (
          <Card
            key={coach.id}
            className={
              coach.isFounder ? 'flex flex-col ring-1 ring-mma-red/60' : 'flex flex-col'
            }
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
              <Image
                src={coach.photoUrl}
                alt={`Coach ${coach.name}`}
                fill
                className="object-cover object-top"
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {coach.isFounder && (
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-mma-red px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
                  Fondateur du club
                </span>
              )}
            </div>
            <CardHeader className="mt-4">
              <CardTitle>{coach.name}</CardTitle>
              <CardDescription>{coach.specialities}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-2 text-sm text-zinc-300">
              <p>{coach.bio}</p>
              <p className="text-xs text-zinc-400">Distinction et mantra : {coach.diplomas}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
