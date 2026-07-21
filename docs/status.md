# Status

## Décisions produit (validées)

- **HelloAsso / paiement en ligne** : reporté — masqué du parcours inscription (Phase 0).
- **Paiements** : uniquement au club — **espèces (cash)**, **chèque**, **virement bancaire**.
- **Échéances** : possibilité de payer en **1, 2 ou 3 fois** (quel que soit le mode).
- **Choix à l’inscription** : l’adhérent choisit mode + nombre d’échéances (étape Tarifs) ; l’admin enregistre ensuite les montants reçus.
- Compte admin : `pretoriamma94@gmail.com` avec `app_metadata.role = 'admin'`.
- **Mot de passe** : réinitialisation en autonomie via `/admin/login/forgot-password` (e-mail Supabase).
- Première connexion : même lien « Mot de passe oublié ou première connexion » pour choisir un mot de passe personnel.
- Redirect URLs Supabase à autoriser : `http://localhost:3000/auth/callback` (+ URL prod).

## Phase 0 — Fait

- Auth `/admin` : login email/mot de passe Supabase Auth.
- Middleware protégeant `/admin/*` (sauf `/admin/login`) + check `app_metadata.role === 'admin'`.
- Page login + bouton déconnexion.
- Actions admin : `requireAdmin()` avant service role.
- Parcours inscription : plus de CTA / textes HelloAsso ; orientation paiement au club.
- Colonnes HelloAsso conservées en DB (non exposées UI).
- Types + migration : `mode_paiement`, `nombre_echeances`, `montant_paye`.

## Phase 1 — Fait (MVP autonomie)

- **Navigation admin** : Accueil | Inscriptions | Paiements / Soldes | Contact | Actualités.
- **Inscriptions** (`/admin/inscriptions`) : filtres statut + recherche nom/email, libellés FR, pagination (25), détails.
- **Marquage paiement** : modal « Enregistrer un paiement » (espèces / chèque / virement, 1–3 fois, montant reçu) → met à jour `montant_paye`, solde, statut `paid` si soldé.
- **Soldes dus** (`/admin/paiements`) : liste des adhérents avec reste > 0 (total, payé, reste, mode, échéances).
- **Contact** : formulaire site → table `contact_messages` ; inbox admin non traités / traités.
- **Actualités** déplacées vers `/admin/actualites` (création + publier/dépublier).
- Migration `20260717160000_paiement_manuel_echeances.sql` **appliquée** sur le projet remote (`pipxrkqqaqwoilfnahru`).

## Parcours inscription — paiement au club (2026-07-18)

- **Pas de paiement en ligne** (HelloAsso masqué / reporté).
- Étape « Tarifs & paiement » : choix obligatoire **mode** (`cash` / `cheque` / `virement`) + **1, 2 ou 3 échéances**, avec montant/échéance indicatif.
- Champs persistés à la création : `mode_paiement`, `nombre_echeances`, `montant_paye = 0`.
- Confirmation `/inscription/paiement-en-attente` : rappelle le mode et le fractionnement choisis.
- L’admin enregistre ensuite les montants réellement reçus (Phase 1).

## Suite (Phase 2+)

- ~~Saisie manuelle adhérent complète côté admin.~~ **Fait** (`/admin/inscriptions/nouvelle`) — adhésions papier.
- Upload photos / documents admin.
- HelloAsso : seulement si décision produit de le réactiver.
- Échéancier détaillé date par date (aujourd’hui : nombre d’échéances + montant / échéance indicatif).

## Inscription manuelle admin (2026-07-18)

- Bouton **+ Inscription papier** sur `/admin/inscriptions`.
- Formulaire : infos adhérent (+ responsable si mineur), cours, montant, mode, échéances, montant déjà payé, cases documents papier.
- Statut auto : `paid` si soldé à la saisie, sinon `pending_payment`.

## Champs adhérent (2026-07-18)

Alignés site + admin papier :

- **Adulte** : prénom, nom, date de naissance, n° + rue, CP, ville, email, téléphone ; taille/poids optionnels ; taille de tenue (XS–XXXL) optionnelle.
- **Mineur (moins de 18 ans)** : prénom, nom, date de naissance, adresse de l’enfant (n° + rue + CP + ville), nom/prénom + téléphone du représentant légal ; téléphone enfant optionnel ; taille/poids optionnels ; taille de tenue optionnelle.
- Migration : `20260718170000_inscription_adresse_mensurations.sql` (`numero_voie`, `rue`, `taille_cm`, `poids_kg`) **appliquée** sur le remote.
- Migration : `20260719190000_taille_tenue.sql` (`taille_tenue`) — tenues club, visible fiche Adhérents.

## Papiers manquants admin (2026-07-18)

- Colonne **Papiers** sur `/admin/inscriptions` (Complet / badges manquants).
- Filtre **Papiers → Manquants / en attente**.
- Tuile **Papiers manquants** sur l’accueil admin.
- Détail inscription : statut certificat + photo + charte + autorisations parentales numériques.

## Documents inscription en ligne (2026-07-18)

- Certificat médical **moins de 3 mois** (PDF/JPG/PNG) ou engagement 3 semaines.
- **Photo d’identité** (JPG/PNG/PDF) ou engagement 3 semaines.
- Mineur : **autorisation parentale** numérique (Oui/Non : sortie seule, voiture particulière, photos/vidéos) — **plus de PDF**.
- Documents fichiers : certificat + photo (adulte & mineur).
- Validation finale : case **charte du club** (`/charte`) obligatoire — texte officiel « Rappel des obligations de l’adhérent·e » (11 points) + cases **assurance individuelle accident** et **droit d’accès / rectification** (loi 78-17) obligatoires.
- Upload réel vers bucket Storage `inscriptions`.
- Migration `20260718190000_photo_charte_inscription.sql` **appliquée**.
- Migration `20260719200000_infos_legales_inscription.sql` (`informe_assurance_individuelle`, `informe_droit_acces`) **appliquée**.
- Migration `20260719210000_autorisations_parentales.sql` (`autorise_sortie_seul`, `autorise_voiture_privee`) **appliquée**.

## Suivi adhérents par année scolaire (2026-07-18)

- Colonne `annee_scolaire` (ex. `2026/2027`) — **1er juillet → 30 juin** (dès juillet = nouvelle saison).
- Statut **`finalized`** (« Finalisé ») quand **tous les docs fichiers** + **paiement soldé**.
  - Adulte : certificat médical + photo.
  - Mineur : idem (autorisations parentales = Oui/Non numériques).
- Admin `/admin/inscriptions` : filtre année (défaut = année courante), badges **rouges** docs manquants, paiement (mode / × / reste dû).
- Auto-passage à Finalisé à l’enregistrement d’un paiement ou d’un scan document si critères OK.
- Migration `20260718200000_annee_scolaire_finalized.sql` **appliquée** sur le remote.
- Correction juillet 2026 : `20260719150000_annee_scolaire_juillet.sql` **appliquée** (cutoff juillet + bascule 2025/2026 → 2026/2027).
- Suppression définitive d’inscriptions admin (`Supprimer`) + policy `20260719160000_inscriptions_admin_delete.sql` **appliquée**.
- **Décompte docs 3 semaines** : échéance = date d’inscription + 21 jours ; affichage `J-X` / `En retard J+N` (liste + fiche).
- **Photos actualités** : upload optionnel vignette + galerie (multi) via bucket `posts-images` ; colonne `galerie_urls`.
- **Historique paiements** : table `inscription_paiements` (date réception, échéance, preuve chèque/virement) — migration `20260719180000_inscription_paiements.sql` **appliquée**.

## Pages légales, cookies & SSL (2026-07-21)

- **Mentions légales** (`/mentions-legales`) : éditeur (association loi 1901), directeur de publication, hébergeur (Vercel), propriété intellectuelle, responsabilité. **Infos officielles renseignées** (source avis SIRENE 29/01/2026) : siège 4 avenue du Maréchal Mortier, 94510 La Queue-en-Brie ; RNA W942012446 ; SIREN 994 391 472 ; SIRET siège 994 391 472 00010 ; APE 93.12Z ; directeur de publication Christophe Ferreira (président).
- **Politique de confidentialité** (`/politique-confidentialite`) : RGPD complet — données collectées (identité, santé/certificat, photo, mineurs, paiements), finalités & bases légales, destinataires (Supabase, Resend, Vercel), durées de conservation, sécurité, droits, CNIL.
- **Gestion des cookies** (`/cookies`) : cookies techniques uniquement (Supabase Auth + `pretoria_cookie_consent`), tableau récap, bouton « Modifier mon choix », renvois CNIL.
- **Bandeau cookies** : `components/CookieConsent.tsx` (client) affiché via layout ; logique dans `lib/cookie-consent.ts` (localStorage `pretoria_cookie_consent`, event `pretoria:cookie-consent-change`). Boutons « Tout accepter » / « Continuer sans accepter ». Réouvrable depuis `/cookies` (`CookiePreferencesButton`).
- **Footer** : ajout du lien « Gestion des cookies ».
- **SSL / sécurité** : `next.config.mjs` → `headers()` ajoute HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` sur toutes les routes. Le certificat TLS lui-même est fourni par l'hébergeur (Vercel = HTTPS auto).
- **À faire côté déploiement** : confirmer l'hébergeur, renseigner les `[À COMPLÉTER]` légaux, activer le domaine en HTTPS.

## Réseaux sociaux dans la navigation (2026-07-21)

- Composant réutilisable `components/SocialLinks.tsx` (Instagram + TikTok) — DRY, remplace le code en dur du footer.
- **Navbar** : icônes réseaux visibles site-wide (desktop, séparateur avant le CTA « S'inscrire » ; menu mobile sous « Suivez-nous »). Donc visibles au-dessus de la ligne de flottaison sur l'accueil.
- **Footer** refactorisé pour utiliser `SocialLinks`.

## Déploiement (2026-07-21)

- Guide complet : **`docs/deploiement.md`** (domaine Vercel, variables d'env, config Supabase Auth URL, reset mot de passe admin, vérifs post-mise en ligne).
- Reset mot de passe admin en prod : nécessite `NEXT_PUBLIC_SITE_URL` (Vercel) + Site URL / Redirect URLs (`/auth/callback`) côté Supabase. Aucun changement de code requis.
- Le client garde l'URL `/admin` en favori (pas de lien public vers l'admin).

## Infra / notes

- Projet Supabase client : `pipxrkqqaqwoilfnahru` (clés dans `.env.local`).
- Pooler DB : région `eu-north-1` (hostname direct `db.*` souvent IPv6-only).
- `supabase link` CLI : nécessite access token ; `db push --db-url` via pooler OK.
- Ancien projet free inaccessible → pas de migration de données.
- **Fix login admin (2026-07-17)** : `LoginForm` → `auth-browser.ts` (pas `auth.ts` / `next/headers`).

## Comment tester

1. `npm run dev` → http://localhost:3000
2. `/inscription` → étape Tarifs : choisir mode + 1/2/3 fois → valider → confirmation affiche le choix
3. `/admin` → login `pretoriamma94@gmail.com`
4. Accueil : tuiles réelles (Inscriptions, Paiements, Contact, Actualités)
5. Inscriptions : filtrer / rechercher ; **+ Inscription papier** ; **Enregistrer un paiement** (montant reçu)
6. Paiements / Soldes : vérifier les restes dus
7. `/contact` : envoyer un message → `/admin/contact` → marquer traité
8. Actualités : créer / publier depuis `/admin/actualites`
