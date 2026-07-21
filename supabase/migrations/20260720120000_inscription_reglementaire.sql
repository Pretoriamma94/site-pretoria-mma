-- À coller dans Supabase → SQL Editor → Run
-- Corrige l’erreur : Could not find the 'accepte_rgpd' column...

do $$ begin
  create type public.sexe_type as enum ('homme', 'femme');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.type_profil_type as enum ('adulte', 'mineur');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.dossier_status_type as enum ('pre_inscrit', 'incomplet', 'complet');
exception when duplicate_object then null;
end $$;

alter table public.inscriptions
  add column if not exists sexe public.sexe_type;

alter table public.inscriptions
  add column if not exists type_profil public.type_profil_type;

alter table public.inscriptions
  add column if not exists dossier_status public.dossier_status_type not null default 'pre_inscrit';

alter table public.inscriptions
  add column if not exists attestation_questionnaire_sante boolean not null default false;

alter table public.inscriptions
  add column if not exists autorisation_pratique_mineur boolean;

alter table public.inscriptions
  add column if not exists autorisation_soins_urgence boolean;

alter table public.inscriptions
  add column if not exists accepte_rgpd boolean not null default false;

comment on column public.inscriptions.sexe is 'Sexe de l''adhérent (homme / femme)';
comment on column public.inscriptions.type_profil is 'Profil choisi à l''inscription : adulte ou mineur';
comment on column public.inscriptions.dossier_status is 'Statut administratif du dossier : pre_inscrit, incomplet, complet';
comment on column public.inscriptions.attestation_questionnaire_sante is 'Ancien champ QS-SPORT (non utilisé — certificat médical obligatoire)';
comment on column public.inscriptions.autorisation_pratique_mineur is 'Mineur : autorisation parentale de pratique sportive';
comment on column public.inscriptions.autorisation_soins_urgence is 'Mineur : autorisation de soins en cas d''urgence';
comment on column public.inscriptions.accepte_rgpd is 'Consentement au traitement des données personnelles (RGPD)';

notify pgrst, 'reload schema';
