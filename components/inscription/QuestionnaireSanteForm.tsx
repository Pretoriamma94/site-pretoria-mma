'use client';

import { OuiNonField } from '@/components/inscription/OuiNonField';
import type { QsSection } from '@/lib/inscription/questionnaire-sante';

type Props = {
  sections: readonly QsSection[];
  answers: Record<string, boolean | null | undefined>;
  onChange: (id: string, value: boolean) => void;
};

export function QuestionnaireSanteForm({ sections, answers, onChange }: Props) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-300">
            {section.title}
          </h3>
          {section.questions.map((q) => (
            <OuiNonField
              key={q.id}
              name={`qs-${q.id}`}
              label={q.text}
              value={answers[q.id]}
              onChange={(v) => onChange(q.id, v)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
