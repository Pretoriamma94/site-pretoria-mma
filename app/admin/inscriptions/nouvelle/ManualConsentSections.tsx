'use client';

import { ConsentCheckbox, RgpdInfoBloc } from '@/components/inscription/ConsentCheckbox';
import { AutorisationParentaleFields } from '@/components/inscription/AutorisationParentaleFields';
import { OuiNonField } from '@/components/inscription/OuiNonField';
import { RappelObligationsAdherent } from '@/components/inscription/RappelObligationsAdherent';
import { CHARTE_PDF_FILENAME, CHARTE_PDF_HREF } from '@/lib/inscription/charte';
import {
  TEXTE_ACCEPTER_RGPD,
  TEXTE_CHARTE_ENGAGEMENT,
  TEXTE_CHARTE_INTRO,
  TEXTE_CHARTE_LUE,
  TEXTE_CHARTE_REGLES,
  TEXTE_INFORME_ASSURANCE,
  TEXTE_INFORME_DROIT_ACCES,
  TEXTE_PUBLICATION_IMAGE_ADULTE,
} from '@/lib/inscription/legal-texts';
import type { ManualFormState, SetManualField } from './manual-form-state';

type Props = {
  form: ManualFormState;
  setField: SetManualField;
  isBaby: boolean;
  isMineur: boolean;
  representantLegal: string;
};

export function ManualInfosSection({ form, setField }: Pick<Props, 'form' | 'setField'>) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Informations
      </h2>
      <ConsentCheckbox
        id="manualInformeAssurance"
        checked={form.informeAssurance}
        onChange={(v) => setField('informeAssurance', v)}
      >
        {TEXTE_INFORME_ASSURANCE} *
      </ConsentCheckbox>
      <ConsentCheckbox
        id="manualInformeDroitAcces"
        checked={form.informeDroitAcces}
        onChange={(v) => setField('informeDroitAcces', v)}
      >
        {TEXTE_INFORME_DROIT_ACCES} *
      </ConsentCheckbox>
    </section>
  );
}

export function ManualAutorisationsSection({
  form,
  setField,
  isBaby,
  isMineur,
  representantLegal,
}: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Autorisations
      </h2>
      {isMineur ? (
        <AutorisationParentaleFields
          namePrefix="manualAuthParent"
          showSortieSeul={!isBaby}
          representantLegal={representantLegal}
          autoriseSortieSeul={form.autoriseSortieSeul}
          autoriseVoiturePrivee={form.autoriseVoiturePrivee}
          autorisePhotos={form.acceptePhotos}
          onSortieSeul={(v) => setField('autoriseSortieSeul', v)}
          onVoiturePrivee={(v) => setField('autoriseVoiturePrivee', v)}
          onPhotos={(v) => setField('acceptePhotos', v)}
        />
      ) : (
        <OuiNonField
          name="manualPublicationImage"
          label={TEXTE_PUBLICATION_IMAGE_ADULTE}
          value={form.acceptePhotos}
          onChange={(v) => setField('acceptePhotos', v)}
        />
      )}
      <RappelObligationsAdherent
        checked={form.accepteReglement}
        onChange={(v) => setField('accepteReglement', v)}
      />
    </section>
  );
}

export function ManualRgpdSection({ form, setField }: Pick<Props, 'form' | 'setField'>) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">RGPD</h2>
      <RgpdInfoBloc />
      <ConsentCheckbox
        id="manualAccepteRgpd"
        checked={form.accepteRgpd}
        onChange={(v) => setField('accepteRgpd', v)}
      >
        {TEXTE_ACCEPTER_RGPD} *
      </ConsentCheckbox>
    </section>
  );
}

export function ManualCharteSection({ form, setField }: Pick<Props, 'form' | 'setField'>) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Charte du club
      </h2>
      <p className="text-xs text-zinc-500">
        Lecture et validation obligatoires, comme en ligne, avant d’enregistrer.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={CHARTE_PDF_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Lire la charte
        </a>
        <a
          href={CHARTE_PDF_HREF}
          download={CHARTE_PDF_FILENAME}
          className="inline-flex rounded-full border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:border-red-500 hover:text-red-400"
        >
          Télécharger la charte (PDF)
        </a>
      </div>
      <fieldset className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/50 p-4">
        <legend className="px-1 text-sm font-semibold text-white">{TEXTE_CHARTE_INTRO}</legend>
        <ConsentCheckbox
          id="manualCharteLue"
          checked={form.charteLue}
          onChange={(v) => setField('charteLue', v)}
        >
          {TEXTE_CHARTE_LUE} *
        </ConsentCheckbox>
        <ConsentCheckbox
          id="manualCharteRegles"
          checked={form.charteReglesConnues}
          onChange={(v) => setField('charteReglesConnues', v)}
        >
          {TEXTE_CHARTE_REGLES} *
        </ConsentCheckbox>
        <ConsentCheckbox
          id="manualCharteEngagement"
          checked={form.charteEngagementRespect}
          onChange={(v) => setField('charteEngagementRespect', v)}
        >
          {TEXTE_CHARTE_ENGAGEMENT} *
        </ConsentCheckbox>
      </fieldset>
    </section>
  );
}
