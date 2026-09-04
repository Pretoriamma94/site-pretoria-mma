-- Attestation questionnaire de santé (preuve association).
-- On n’enregistre PAS les réponses individuelles : uniquement le texte coché,
-- la date et l’identité du déclarant.

alter table public.inscriptions
  add column if not exists questionnaire_sante jsonb;

comment on column public.inscriptions.questionnaire_sante is
  'Attestation QS (texte, date ISO, identité déclarant/adhérent). Pas de réponses individuelles.';

comment on column public.inscriptions.attestation_questionnaire_sante is
  'True si le déclarant a attesté avoir répondu NON à l’ensemble des rubriques (certificat non requis).';

notify pgrst, 'reload schema';
