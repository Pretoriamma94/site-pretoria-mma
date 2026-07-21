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
  namePrefix = 'authParent',
}: Props) {
  return (
    <div className="space-y-5 rounded-xl border border-amber-900/50 bg-amber-950/15 p-4">
      <h3 className="font-semibold text-white">Autorisation parentale</h3>

      <OuiNonField
        name={`${namePrefix}-sortie`}
        label="Autorise mon enfant à quitter seul le lieu d’entraînement ou de compétition, sous ma responsabilité."
        value={autoriseSortieSeul}
        onChange={onSortieSeul}
        error={errors?.autoriseSortieSeul}
      />

      <OuiNonField
        name={`${namePrefix}-voiture`}
        label="Autorise mon enfant à prendre place dans une voiture particulière afin d’effectuer les déplacements nécessaires aux compétitions sportives officielles, amicales ou de loisirs."
        value={autoriseVoiturePrivee}
        onChange={onVoiturePrivee}
        error={errors?.autoriseVoiturePrivee}
      />

      <OuiNonField
        name={`${namePrefix}-photos`}
        label="Autorise le club à prendre des photos et à filmer mon enfant à l’occasion des activités sportives ou associatives auxquelles il/elle participe, et autorise leur publication dans le bulletin d’information et sur le site internet du club."
        value={autorisePhotos}
        onChange={onPhotos}
        error={errors?.autorisePhotos}
      />
    </div>
  );
}
