# Assets (photos)

## Photos des coachs

La page `app/equipe/page.tsx` utilise ces chemins par défaut (fallback) :

- `/images/coachs/romain.jpg`
- `/images/coachs/pacino.jpg`
- `/images/coachs/christophe.jpg`
- placeholder : `/images/coachs/placeholder.svg`

### Ajouter / remplacer une photo

1. Dépose tes fichiers dans `public/images/coachs/`
2. Nomme-les exactement comme ci-dessus (ou adapte les chemins dans `app/equipe/page.tsx`)

### Formats conseillés

- JPG ou WEBP
- Ratio recommandé : 3:2 ou 4:3
- Taille recommandée : ~1200px de large (ou plus), poids < 300–500 Ko si possible

## Photos “Le club”

La page `app/le-club/page.tsx` référence aussi des images dans `/images/...` (hero + salle).  
Si tu veux, on peut les organiser pareil dans `public/images/` et/ou les basculer sur Supabase Storage.

