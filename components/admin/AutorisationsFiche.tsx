import { isMinor } from '@/lib/inscription/schema';
import { cn } from '@/lib/utils';

export type AutorisationsFicheData = {
  type_profil?: 'adulte' | 'mineur' | null;
  date_naissance?: string | null;
  cours_selectionne?: string | null;
  informe_assurance_individuelle?: boolean | null;
  informe_droit_acces?: boolean | null;
  accepte_rgpd?: boolean | null;
  accepte_reglement?: boolean | null;
  accepte_charte?: boolean | null;
  autorise_sortie_seul?: boolean | null;
  autorise_voiture_privee?: boolean | null;
  autorise_photos?: boolean | null;
};

export function OuiNonIndicateur({
  value,
  ouiLabel = 'Oui',
  nonLabel = 'Non',
}: {
  value: boolean | null | undefined;
  ouiLabel?: string;
  nonLabel?: string;
}) {
  if (value === true) {
    return <span className="font-semibold text-emerald-300">{ouiLabel}</span>;
  }
  if (value === false) {
    return <span className="font-semibold text-red-400">{nonLabel}</span>;
  }
  return <span className="text-zinc-500">—</span>;
}

function Ligne({
  label,
  value,
  ouiLabel,
  nonLabel,
}: {
  label: string;
  value: boolean | null | undefined;
  ouiLabel?: string;
  nonLabel?: string;
}) {
  const refused = value === false;
  return (
    <li
      className={cn(
        'flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3',
        refused && 'rounded-md bg-red-950/35 px-2 py-1',
      )}
    >
      <span className={cn('text-zinc-300', refused && 'text-red-100')}>{label}</span>
      <span className="shrink-0">
        <OuiNonIndicateur value={value} ouiLabel={ouiLabel} nonLabel={nonLabel} />
      </span>
    </li>
  );
}

function isMineurFiche(row: AutorisationsFicheData): boolean {
  if (row.type_profil === 'mineur') return true;
  if (row.cours_selectionne === 'baby') return true;
  if (row.date_naissance && isMinor(row.date_naissance)) return true;
  return false;
}

/** Réponses d’inscription (Oui / Non) — refus en rouge. */
export function AutorisationsFiche({ row }: { row: AutorisationsFicheData }) {
  const mineur = isMineurFiche(row);
  const isBaby = row.cours_selectionne === 'baby';
  const droitAcces = row.informe_droit_acces ?? row.accepte_rgpd;
  const charteValidee =
    row.accepte_charte === true ? true : row.accepte_charte === false ? false : null;

  return (
    <div className="space-y-4">
      <section>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
          Informations
        </p>
        <ul className="mt-1.5 space-y-1.5 text-xs">
          <Ligne
            label="Informé de l’intérêt d’une assurance « individuelle accident »"
            value={row.informe_assurance_individuelle}
          />
          <Ligne
            label="Informé du droit d’accès et de rectification (secrétariat du club)"
            value={droitAcces}
          />
        </ul>
      </section>

      {mineur ? (
        <section>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
            Pour les mineur.e.s — autorisation parentale
          </p>
          <ul className="mt-1.5 space-y-1.5 text-xs">
            {!isBaby ? (
              <Ligne
                label="Quitter seul le lieu d’entraînement ou de compétition"
                value={row.autorise_sortie_seul}
              />
            ) : null}
            <Ligne
              label="Prendre place dans une voiture particulière (compétitions / loisirs)"
              value={row.autorise_voiture_privee}
            />
            <Ligne
              label="Photos et films de l’enfant + publication (bulletin / site du club)"
              value={row.autorise_photos}
            />
          </ul>
        </section>
      ) : (
        <section>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
            Publication de mon image
          </p>
          <ul className="mt-1.5 space-y-1.5 text-xs">
            <Ligne
              label="Photos / films et publication sur les supports du club"
              value={row.autorise_photos}
            />
          </ul>
        </section>
      )}

      <section>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
          Rappel des obligations / charte
        </p>
        <ul className="mt-1.5 space-y-1.5 text-xs">
          <Ligne
            label="Rappel des obligations — lu et approuvé"
            value={row.accepte_reglement}
          />
          <Ligne
            label="Charte lue, règles du club connues, engagement à les respecter"
            value={charteValidee}
          />
        </ul>
      </section>
    </div>
  );
}
