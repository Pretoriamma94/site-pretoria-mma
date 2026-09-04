-- Scan du questionnaire de santé papier (inscription manuelle).
-- PDF / JPG / PNG stocké dans le bucket inscriptions.

alter table public.inscriptions
  add column if not exists questionnaire_sante_url text;

comment on column public.inscriptions.questionnaire_sante_url is
  'Chemin Storage du questionnaire de santé papier scanné (PDF, JPG ou PNG).';

notify pgrst, 'reload schema';
