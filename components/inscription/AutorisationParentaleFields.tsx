'use client';

import { OuiNonField } from '@/components/inscription/OuiNonField';

type Props = {
  autoriseSortieSeul: boolean | null | undefined;
  autoriseVoiturePrivee: boolean | null | undefined;
  autorisePhotos: boolean | null | undefined;
  onSortieSeul: (v: boolean) => void;
  onVoiturePrivee: (v: boolean) => void;
  onPhotos: (v: boolean) => void;
  errors?: {
    autoriseSortieSeul?: string;
    autoriseVoiturePrivee?: string;
    autorisePhotos?: string;
  };
  showSortieSeul?: boolean;
  /** Nom-prénom du représentant légal (étape Identité). */
  representantLegal?: string;
  /** Préfixe unique pour les name radio (éviter collisions) */
  namePrefix?: string;
};

export function AutorisationParentaleFields({
  autoriseSortieSeul,
  autoriseVoiturePrivee,
  autorisePhotos,
  onSortieSeul,
  onVoiturePrivee,
  onPhotos,
  errors,
  showSortieSeul = true,
  representantLegal,
  namePrefix = 'authParent',
}: Props) {
  return (
    <div className="space-y-5 rounded-xl border border-amber-900/50 bg-amber-950/15 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
        Pour les mineur.e.s — autorisation parentale
      </h3>
      <p className="text-sm text-zinc-300">
        Je soussigné(e)
        {representantLegal ? (
          <>
            {' '}
            <span className="font-medium text-white">{representantLegal}</span>
          </>
        ) : null}{' '}
        (représentant légal)
      </p>

      {showSortieSeul && (
        <OuiNonField
          name={`${namePrefix}-sortie`}
          label="autorise mon enfant à quitter seul le lieu d’entraînement ou de compétition, cela sous ma responsabilité."
          value={autoriseSortieSeul}
          onChange={onSortieSeul}
          error={errors?.autoriseSortieSeul}
        />
      )}

      <OuiNonField
        name={`${namePrefix}-voiture`}
        label="autorise mon enfant à prendre place dans une voiture particulière afin d’effectuer les déplacements nécessaires par les compétitions sportives officielles, amicales ou de loisirs."
        value={autoriseVoiturePrivee}
        onChange={onVoiturePrivee}
        error={errors?.autoriseVoiturePrivee}
      />

      <OuiNonField
        name={`${namePrefix}-photos`}
        label="autorise le club à prendre des photos et à filmer mon enfant à l’occasion des activités sportives ou associatives auxquels il/elle participe et autorise leur publication dans le bulletin d’information et sur le site internet du club."
        value={autorisePhotos}
        onChange={onPhotos}
        error={errors?.autorisePhotos}
      />
    </div>
  );
}
