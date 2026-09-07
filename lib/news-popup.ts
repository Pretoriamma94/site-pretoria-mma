import { createServerClient } from '@/lib/supabase/server';
import { missingDbColumn, retrySelectOnMissingColumn } from '@/lib/admin/inscription-fields';
import { parseMaxAffichages, type NewsPopupMaxAffichages } from '@/lib/news-popup-visitor';

const PARIS_TZ = 'Europe/Paris';

export type NewsPopupPayload = {
  id: string;
  titre: string;
  slug: string;
  resume: string;
  image_url: string | null;
  max_affichages: NewsPopupMaxAffichages;
};

export type PopupScheduleInput = {
  popup_actif: boolean;
  popup_debut: string | null;
  popup_fin: string | null;
  popup_max_affichages: NewsPopupMaxAffichages;
};

export type PopupAdminStatus = 'off' | 'live' | 'scheduled' | 'expired';

type PopupScheduleRow = {
  popup_actif?: boolean | null;
  popup_debut?: string | null;
  popup_fin?: string | null;
};

const POST_POPUP_SELECT =
  'id, titre, slug, resume, contenu, image_url, popup_actif, popup_debut, popup_fin, popup_max_affichages';

function parisParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** datetime-local (civil Paris) → ISO UTC. */
export function parisDatetimeLocalToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const seen = parisParts(new Date(utcGuess));
  const asIfParis = Date.UTC(
    Number(seen.year),
    Number(seen.month) - 1,
    Number(seen.day),
    Number(seen.hour),
    Number(seen.minute),
  );
  return new Date(utcGuess - (asIfParis - utcGuess)).toISOString();
}

export function isoToParisDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const parts = parisParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parsePopupFormFields(
  formData: FormData,
): PopupScheduleInput | { error: string } {
  const popup_actif = formData.get('popup_actif') === 'on';
  const popup_debut = parisDatetimeLocalToIso(String(formData.get('popup_debut') ?? ''));
  const popup_fin = parisDatetimeLocalToIso(String(formData.get('popup_fin') ?? ''));

  if (popup_debut && popup_fin && popup_debut >= popup_fin) {
    return { error: 'La date de fin du pop-up doit être postérieure à la date de début.' };
  }

  return {
    popup_actif,
    popup_debut,
    popup_fin,
    popup_max_affichages: parseMaxAffichages(formData.get('popup_max_affichages')),
  };
}

export function isPopupInSchedule(row: PopupScheduleRow, nowMs = Date.now()): boolean {
  if (!row.popup_actif) return false;
  if (row.popup_debut) {
    const start = new Date(row.popup_debut).getTime();
    if (!Number.isNaN(start) && nowMs < start) return false;
  }
  if (row.popup_fin) {
    const end = new Date(row.popup_fin).getTime();
    if (!Number.isNaN(end) && nowMs > end) return false;
  }
  return true;
}

export function popupAdminStatus(row: PopupScheduleRow, nowMs = Date.now()): PopupAdminStatus {
  if (!row.popup_actif) return 'off';
  if (row.popup_debut) {
    const start = new Date(row.popup_debut).getTime();
    if (!Number.isNaN(start) && nowMs < start) return 'scheduled';
  }
  if (row.popup_fin) {
    const end = new Date(row.popup_fin).getTime();
    if (!Number.isNaN(end) && nowMs > end) return 'expired';
  }
  return 'live';
}

export function newsPopupTeaser(resume: string | null, contenu: string): string {
  const fromResume = resume?.trim();
  if (fromResume) return fromResume.slice(0, 280);
  const plain = contenu.replace(/\s+/g, ' ').trim();
  if (plain.length <= 180) return plain;
  return `${plain.slice(0, 177).trim()}…`;
}

export function isNewsPopupExcludedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/inscription') ||
    pathname.startsWith('/mon-inscription') ||
    pathname.startsWith('/auth')
  );
}

const POPUP_MIGRATION_HINT =
  'Le pop-up nécessite la migration actualités (colonnes popup_actif / popup_debut / popup_fin). Appliquez supabase/migrations/20260907140000_posts_popup.sql.';

const POPUP_MAX_MIGRATION_HINT =
  'Le nombre d’affichages du pop-up nécessite la migration supabase/migrations/20260907150000_posts_popup_max_affichages.sql.';

export async function deactivateOtherPopups(keepId?: string): Promise<{ error: string | null }> {
  const supabase = createServerClient();
  let query = supabase.from('posts').update({ popup_actif: false }).eq('popup_actif', true);
  if (keepId) {
    query = query.neq('id', keepId);
  }
  const { error } = await query;
  if (!error) return { error: null };
  const missing = missingDbColumn(error.message);
  if (missing) return { error: POPUP_MIGRATION_HINT };
  return { error: error.message };
}

export async function applyPopupSchedule(options: {
  keepId?: string;
  schedule: PopupScheduleInput;
}): Promise<{ error: string | null }> {
  if (!options.schedule.popup_actif) return { error: null };
  return deactivateOtherPopups(options.keepId);
}

type PopupQueryRow = {
  id: string;
  titre: string;
  slug: string;
  resume: string | null;
  contenu: string;
  image_url: string | null;
  popup_actif?: boolean | null;
  popup_debut?: string | null;
  popup_fin?: string | null;
  popup_max_affichages?: number | null;
};

export async function getActiveNewsPopup(): Promise<NewsPopupPayload | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await retrySelectOnMissingColumn(
      (select) =>
        supabase
          .from('posts')
          .select(select)
          .eq('publie', true)
          .eq('popup_actif', true)
          .order('updated_at', { ascending: false })
          .limit(5) as unknown as Promise<{
          data: PopupQueryRow[] | null;
          error: { message: string } | null;
        }>,
      POST_POPUP_SELECT,
    );

    if (error) {
      if (missingDbColumn(error.message)) return null;
      console.error('[news-popup] lecture échouée', error.message);
      return null;
    }

    const now = Date.now();
    const match = ((data ?? []) as PopupQueryRow[]).find((row) => isPopupInSchedule(row, now));
    if (!match) return null;

    return {
      id: match.id,
      titre: match.titre,
      slug: match.slug,
      resume: newsPopupTeaser(match.resume, match.contenu),
      image_url: match.image_url,
      max_affichages: parseMaxAffichages(match.popup_max_affichages),
    };
  } catch (err) {
    console.error('[news-popup] Supabase indisponible', err);
    return null;
  }
}

export function popupColumnsMissingMessage(message: string): string | null {
  const missing = missingDbColumn(message);
  if (!missing) return null;
  if (missing === 'popup_max_affichages') {
    return POPUP_MAX_MIGRATION_HINT;
  }
  if (missing === 'popup_actif' || missing === 'popup_debut' || missing === 'popup_fin') {
    return POPUP_MIGRATION_HINT;
  }
  return null;
}

export function popupConflictMessage(message: string): string | null {
  if (/duplicate key|unique constraint|posts_one_popup_actif/i.test(message)) {
    return 'Une seule actualité peut être affichée en pop-up. Réessayez.';
  }
  return null;
}
