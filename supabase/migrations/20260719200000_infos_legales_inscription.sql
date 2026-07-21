-- Informations légales cochées à l'inscription (assurance + droit d'accès)

alter table public.inscriptions
  add column if not exists informe_assurance_individuelle boolean not null default false;

alter table public.inscriptions
  add column if not exists informe_droit_acces boolean not null default false;

comment on column public.inscriptions.informe_assurance_individuelle is
  'Reconnaît avoir été informé de l’intérêt de souscrire une assurance individuelle accident';

comment on column public.inscriptions.informe_droit_acces is
  'Reconnaît avoir été informé du droit d’accès et de rectification des données (loi 78-17)';
