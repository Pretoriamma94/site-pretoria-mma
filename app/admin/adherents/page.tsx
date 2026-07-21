import { redirect } from 'next/navigation';
import { getAuthUser, isAdminUser } from '@/lib/supabase/auth';
import { createServerClient } from '@/lib/supabase/server';
import {
  getCurrentSchoolYear,
  listSchoolYearOptions,
} from '@/lib/admin/school-year';
import {
  AdherentsDirectory,
  type AdherentRow,
} from './AdherentsDirectory';

const ADHERENT_SELECT = [
  'id',
  'nom',
  'prenom',
  'email',
  'telephone',
  'date_naissance',
  'adresse',
  'numero_voie',
  'rue',
  'code_postal',
  'ville',
  'responsable_legal',
  'photo_url',
  'taille_cm',
  'poids_kg',
  'taille_tenue',
  'autorise_photos',
  'autorise_sortie_seul',
  'autorise_voiture_privee',
  'autorisation_pratique_mineur',
  'autorisation_soins_urgence',
  'accepte_rgpd',
  'accepte_reglement',
  'accepte_charte',
  'type_profil',
  'sexe',
  'dossier_status',
  'annee_scolaire',
  'cours_selectionne',
].join(', ');

type SearchParams = Promise<{ annee?: string; q?: string }>;

export default async function AdminAdherentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const currentYear = getCurrentSchoolYear();
  const anneeFilter = params.annee ?? currentYear;
  const query = (params.q ?? '').trim();

  const supabase = createServerClient();

  const { data: yearRows } = await supabase
    .from('inscriptions')
    .select('annee_scolaire')
    .neq('status', 'cancelled')
    .not('annee_scolaire', 'is', null);

  const yearsFromDb = Array.from(
    new Set((yearRows ?? []).map((r) => r.annee_scolaire).filter(Boolean)),
  ) as string[];
  const yearOptions = Array.from(
    new Set([...listSchoolYearOptions(currentYear), ...yearsFromDb]),
  )
    .filter((y) => y >= currentYear)
    .sort((a, b) => b.localeCompare(a));

  let builder = supabase
    .from('inscriptions')
    .select(ADHERENT_SELECT)
    .neq('status', 'cancelled')
    .order('nom', { ascending: true })
    .order('prenom', { ascending: true });

  if (anneeFilter !== 'all') {
    builder = builder.eq('annee_scolaire', anneeFilter);
  }

  if (query) {
    const safe = query.replace(/[%_,]/g, ' ').trim();
    if (safe) {
      builder = builder.or(`nom.ilike.%${safe}%,prenom.ilike.%${safe}%`);
    }
  }

  const { data, error } = await builder;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-red-400">
          Impossible de charger les adhérents : {error.message}
        </p>
      </div>
    );
  }

  const rows = (data ?? []) as unknown as AdherentRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <AdherentsDirectory
        key={`${anneeFilter}-${query}`}
        initialRows={rows}
        anneeFilter={anneeFilter}
        yearOptions={yearOptions}
        query={query}
      />
    </div>
  );
}
