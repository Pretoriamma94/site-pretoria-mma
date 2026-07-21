-- Pretoria MMA — schéma initial

-- ENUMS
create type niveau_type as enum (
  'enfant_debutant',
  'enfant_confirme',
  'adulte_debutant',
  'adulte_confirme'
);

create type statut_abonnement_type as enum (
  'actif',
  'expire',
  'en_attente'
);

create type type_abonnement_type as enum (
  'mensuel',
  'trimestriel',
  'annuel'
);

create type categorie_type as enum (
  'evenement',
  'competition',
  'vie_du_club',
  'conseils'
);

create type document_type as enum (
  'charte',
  'formulaire_adhesion',
  'reglement_interieur',
  'decharge_responsabilite',
  'informatif'
);

create type jour_semaine_type as enum (
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche'
);

create type inscription_status_type as enum (
  'pending_payment',
  'paid',
  'validated',
  'cancelled'
);

-- TABLE PROFILES
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nom text,
  prenom text,
  telephone text,
  date_naissance date,
  adresse text,
  ville text,
  code_postal text,
  niveau niveau_type,
  date_inscription timestamptz default now(),
  statut_abonnement statut_abonnement_type,
  type_abonnement type_abonnement_type,
  date_fin_abonnement date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLE POSTS
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  slug text not null unique,
  contenu text not null,
  resume text,
  image_url text,
  categorie categorie_type not null,
  auteur_id uuid references public.profiles (id) on delete set null,
  publie boolean not null default false,
  date_publication timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLE CONTACT_MESSAGES
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text not null,
  sujet text not null,
  message text not null,
  traite boolean not null default false,
  date_traitement timestamptz,
  created_at timestamptz default now()
);

-- TABLE COACHES
create table public.coaches (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  bio text,
  photo_url text,
  specialites text[],
  diplomes text[],
  ordre_affichage integer,
  actif boolean not null default true,
  created_at timestamptz default now()
);

-- TABLE DOCUMENTS
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  type document_type not null,
  fichier_url text not null,
  version text,
  obligatoire boolean not null default false,
  pour_enfants boolean not null default false,
  pour_adultes boolean not null default true,
  actif boolean not null default true,
  ordre_affichage integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLE MEMBER_DOCUMENTS
create table public.member_documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  consulte boolean not null default false,
  date_consultation timestamptz,
  signe boolean not null default false,
  date_signature timestamptz,
  signature_data text,
  ip_signature text,
  fichier_signe_url text,
  created_at timestamptz default now(),
  constraint member_documents_unique unique (member_id, document_id)
);

-- TABLE SCHEDULES
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  jour_semaine jour_semaine_type not null,
  heure_debut time not null,
  heure_fin time not null,
  niveau text,
  type_cours text,
  salle text,
  professeur_id uuid references public.coaches (id) on delete set null,
  actif boolean not null default true
);

-- TABLE INSCRIPTIONS (formulaire d'inscription + HelloAsso)
create table public.inscriptions (
  id uuid primary key default gen_random_uuid(),
  status inscription_status_type not null default 'pending_payment',
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text not null,
  date_naissance date,
  adresse text not null,
  code_postal text not null,
  ville text not null,
  responsable_legal jsonb,
  cours_selectionne text not null,
  inscription_familiale boolean not null default false,
  membre_2 jsonb,
  type_tarif text not null default 'individuel',
  montant_total numeric(10, 2) not null,
  certificat_medical_url text,
  autorisation_parentale_url text,
  accepte_reglement boolean not null default false,
  atteste_certificat boolean not null default false,
  autorise_photos boolean,
  helloasso_payment_id text,
  helloasso_payment_url text,
  date_paiement timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz
);

-- INDEX
create index inscriptions_status_idx on public.inscriptions (status);
create index inscriptions_created_at_idx on public.inscriptions (created_at desc);
create index posts_publie_date_idx on public.posts (publie, date_publication desc);

-- TRIGGER updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create trigger inscriptions_set_updated_at
  before update on public.inscriptions
  for each row execute function public.set_updated_at();

-- TRIGGER : créer un profil à l'inscription auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
