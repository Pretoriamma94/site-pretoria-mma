-- Année scolaire club : démarre le 1er juillet (pas le 1er septembre)

comment on column public.inscriptions.annee_scolaire is
  'Année scolaire d''adhésion, ex. 2026/2027 (1er juillet → 30 juin)';

-- Default dynamique : dès juillet = année N / N+1
alter table public.inscriptions
  alter column annee_scolaire set default (
    case
      when extract(month from now()) >= 7
        then extract(year from now())::int::text
          || '/'
          || (extract(year from now())::int + 1)::text
      else (extract(year from now())::int - 1)::text
          || '/'
          || extract(year from now())::int::text
    end
  );

-- Recalcul des inscriptions déjà en 2025/2026 créées en saison d’été 2026
-- (juillet–août 2026 = déjà 2026/2027)
update public.inscriptions
set annee_scolaire = '2026/2027'
where annee_scolaire = '2025/2026'
  and extract(year from coalesce(created_at, now())) = 2026
  and extract(month from coalesce(created_at, now())) >= 7;
