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
import { missingDbColumn, withoutSelectColumn } from '@/lib/admin/inscription-fields';

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
  'autorise_photos',
  'autorise_sortie_seul',
  'autorise_voiture_privee',
  'autorisation_pratique_mineur',
  'autorisation_soins_urgence',
  'accepte_rgpd',
  'accepte_reglement',
  'accepte_charte',
  'informe_assurance_individuelle',
  'informe_droit_acces',
  'type_profil',
  'sexe',
  'dossier_status',
  'annee_scolaire',
  'cours_selectionne',
  'status',
  'montant_total',
  'montant_paye',
  'date_paiement',
  'mode_paiement',
  'nombre_echeances',
  'certificat_medical_url',
  'attestation_questionnaire_sante',
  'questionnaire_sante',
  'questionnaire_sante_url',
  'certificat_engagement_3_semaines',
  'photo_engagement_3_semaines',
  'created_at',
  'type_tarif',
  'membre_bureau',
  'voie_inscription',
  'membre_2',
].join(', ');

async function withLastPaymentDates(rows: AdherentRow[]): Promise<AdherentRow[]> {
  if (rows.length === 0) return rows;
  const supabase = createServerClient();
  const { data } = await supabase
    .from('inscription_paiements')
    .select('inscription_id, date_reception')
    .in(
      'inscription_id',
      rows.map((r) => r.id),
    );

  const lastById: Record<string, string> = {};
  for (const paiement of data ?? []) {
    const current = lastById[paiement.inscription_id];
    if (!current || paiement.date_reception > current) {
      lastById[paiement.inscription_id] = paiement.date_reception;
    }
  }

  return rows.map((row) => ({
    ...row,
    date_dernier_paiement: lastById[row.id] ?? row.date_paiement ?? null,
  }));
}

type SearchParams = Promise<{ annee?: string; q?: string; categorie?: string }>;

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
  const categorieRaw = (params.categorie ?? 'all').trim();
  const categorieFilter = [
    'all',
    'baby',
    'mma',
    'mma_enfants',
    'mma_ados',
    'mma_mixte',
    'mma_femmes',
    'ados_7_11',
    'ados_11_18',
    'adultes',
  ].includes(categorieRaw)
    ? categorieRaw === 'ados_7_11'
      ? 'mma_enfants'
      : categorieRaw === 'ados_11_18'
        ? 'mma_ados'
        : categorieRaw === 'adultes' || categorieRaw === 'mma'
          ? 'mma'
          : categorieRaw
    : 'all';

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

  let select = ADHERENT_SELECT;
  let data: unknown[] | null = null;
  let error: { message: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    let builder = supabase
      .from('inscriptions')
      .select(select)
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

    const result = await builder;
    data = result.data;
    error = result.error;
    if (!error) break;
    const missing = missingDbColumn(error.message);
    if (!missing || !select.split(',').map((part) => part.trim()).includes(missing)) {
      break;
    }
    select = withoutSelectColumn(select, missing);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-red-400">
          Impossible de charger les adhérents : {error.message}
        </p>
      </div>
    );
  }

  const rows = await withLastPaymentDates((data ?? []) as unknown as AdherentRow[]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <AdherentsDirectory
        key={`${anneeFilter}-${query}-${categorieFilter}`}
        initialRows={rows}
        anneeFilter={anneeFilter}
        categorieFilter={categorieFilter}
        yearOptions={yearOptions}
        query={query}
      />
    </div>
  );
}
