-- Données de démarrage Pretoria MMA (optionnel)

-- Coaches par défaut
insert into public.coaches (nom, prenom, bio, photo_url, specialites, diplomes, ordre_affichage, actif)
values
  (
    'Coach 1',
    '',
    'À compléter',
    '/images/coach-1.jpg',
    array['MMA', 'Boxe'],
    array['À compléter'],
    1,
    true
  ),
  (
    'Coach 2',
    '',
    'À compléter',
    '/images/coach-2.jpg',
    array['Jiu-Jitsu', 'Grappling'],
    array['À compléter'],
    2,
    true
  );

-- Article d'exemple (ignoré si slug déjà présent)
insert into public.posts (titre, slug, contenu, resume, categorie, publie, date_publication, image_url)
values (
  'Bienvenue chez Pretoria MMA',
  'bienvenue-chez-pretoria-mma',
  'Le club Pretoria MMA ouvre ses portes à La Queue-en-Brie. Cours pour enfants, ados et adultes, tous niveaux.',
  'Découvrez notre club de MMA à La Queue-en-Brie (94).',
  'vie_du_club',
  true,
  now(),
  null
)
on conflict (slug) do nothing;
