'use client';

import { ConsentCheckbox } from '@/components/inscription/ConsentCheckbox';
import { OBLIGATIONS_ADHERENT } from '@/lib/inscription/obligations-adherent';

type Props = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  showConsent?: boolean;
};

export function RappelObligationsAdherent({
  checked = false,
  onChange,
  error,
  showConsent = true,
}: Props) {
  return (
    <section className="mt-6 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
        Rappel des obligations de l’adhérent.e
      </h3>
      <ol className="space-y-4 text-sm leading-relaxed text-zinc-200">
        {OBLIGATIONS_ADHERENT.map((item) => (
          <li key={item.n} className="flex gap-3">
            <span className="w-6 shrink-0 font-semibold text-red-400">{item.n}.</span>
            <div className="min-w-0 flex-1">
              <p>{item.text}</p>
              {item.items ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
                  {item.items.map((sub) => (
                    <li key={sub}>{sub}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      {showConsent && onChange ? (
        <ConsentCheckbox id="luApprouve" checked={checked} onChange={onChange} error={error}>
          Lu et approuvé *
        </ConsentCheckbox>
      ) : null}
    </section>
  );
}
