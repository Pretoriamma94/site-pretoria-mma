-- Adresse structurée + mensurations pour inscriptions (site + papier)

alter table public.inscriptions
  add column if not exists numero_voie text,
  add column if not exists rue text,
  add column if not exists taille_cm numeric(5, 1),
  add column if not exists poids_kg numeric(5, 1);

comment on column public.inscriptions.numero_voie is
  'Numéro de voie de l''adresse principale de l''adhérent';
comment on column public.inscriptions.rue is
  'Nom de rue / voie';
comment on column public.inscriptions.taille_cm is
  'Taille en cm (optionnelle)';
comment on column public.inscriptions.poids_kg is
  'Poids en kg (optionnel)';

-- Rétrocompat : remplir numero_voie/rue depuis adresse si vide
update public.inscriptions
set
  numero_voie = coalesce(nullif(trim(numero_voie), ''), split_part(trim(adresse), ' ', 1)),
  rue = coalesce(
    nullif(trim(rue), ''),
    nullif(trim(substr(trim(adresse), length(split_part(trim(adresse), ' ', 1)) + 2)), '')
  )
where adresse is not null
  and trim(adresse) <> ''
  and (numero_voie is null or trim(numero_voie) = '' or rue is null or trim(rue) = '');
