-- Année scolaire + statut finalisé

alter type public.inscription_status_type add value if not exists 'finalized';

alter table public.inscriptions
  add column if not exists annee_scolaire text;

comment on column public.inscriptions.annee_scolaire is
  'Année scolaire d''adhésion, ex. 2026/2027 (sept. → août)';

-- Backfill depuis created_at (année scolaire FR : sept → août)
update public.inscriptions
set annee_scolaire = case
  when extract(month from coalesce(created_at, now())) >= 9
    then (extract(year from coalesce(created_at, now()))::int)::text
      || '/'
      || (extract(year from coalesce(created_at, now()))::int + 1)::text
  else (extract(year from coalesce(created_at, now()))::int - 1)::text
      || '/'
      || (extract(year from coalesce(created_at, now()))::int)::text
end
where annee_scolaire is null or trim(annee_scolaire) = '';

alter table public.inscriptions
  alter column annee_scolaire set default (
    case
      when extract(month from now()) >= 9
        then extract(year from now())::int::text
          || '/'
          || (extract(year from now())::int + 1)::text
      else (extract(year from now())::int - 1)::text
          || '/'
          || extract(year from now())::int::text
    end
  );

alter table public.inscriptions
  alter column annee_scolaire set not null;

-- Contrainte souple format AAAA/AAAA
alter table public.inscriptions
  drop constraint if exists inscriptions_annee_scolaire_check;

alter table public.inscriptions
  add constraint inscriptions_annee_scolaire_check
  check (annee_scolaire ~ '^\d{4}/\d{4}$');

create index if not exists inscriptions_annee_scolaire_idx
  on public.inscriptions (annee_scolaire);
