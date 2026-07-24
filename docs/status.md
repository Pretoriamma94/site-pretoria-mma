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

## Dépenses & résultat net (2026-07-24)

- Table `club_depenses` (migration `20260724140000_club_depenses.sql`) — **à pusher au déploiement**.
- Page **Finances** (`/admin/paiements`) : indicateurs **Recettes dues / Encaissées / En attente / Dépenses / Résultat net** (encaissé − dépenses).
- Formulaire d'ajout de dépense (libellé, montant, date, catégorie, note) + liste / suppression.
- Catégories : matériel, location, compétition, assurance, déplacement, communication, autre.
- Année scolaire dérivée automatiquement de la date de dépense.

## Suivi des recettes club (2026-07-24)

- Page `/admin/paiements` : 3 indicateurs — **Recettes totales** (cotisations dues), **Déjà encaissées**, **En attente** (+ % et nb de soldes ouverts).
- Filtre année scolaire ; liste des soldes à encaisser conservée en dessous.
- Dashboard admin : tuile « Recettes du club » (montant encaissé + reste en attente).
- Helper `computeRecettesClub` dans `lib/admin/labels.ts`.

## Filtre adhérents par catégorie (2026-07-24)

- Sur `/admin/adherents` : filtre **Catégorie** (Baby JJB 3-6 ans, Ados 7-11, Ados 11-18, Adultes) + puces avec effectifs.
- Colonne **Catégorie** dans le tableau ; l'export Excel reprend la sélection affichée.
- Filtrage basé sur `cours_selectionne` (catégorie d'inscription, alignée sur les tranches d'âge).

## Charte sportive PDF téléchargeable (2026-07-24)

- PDF officiel placé dans `public/documents/charte-sportive-pretoria.pdf`.
- Bouton **Télécharger la charte (PDF)** sur `/charte` + lien **télécharger le PDF** à l'étape Autorisations de l'inscription (à côté de « consulter »).

## Édition profil adhérent admin (2026-07-24)

- Les admins peuvent **corriger / mettre à jour** un profil depuis **Inscriptions** et **Adhérents**.
- Modal partagé `EditProfileModal` + action `updateInscriptionProfileAction` (Zod `editProfileSchema`).
- Champs éditables : identité (nom, prénom, date de naissance, sexe), contact (email, téléphone), adresse, mensurations / taille de tenue, responsable légal (mineur), consentements (RGPD, règlement, charte, assurance), **droit à l'image** (photos site & réseaux), autorisations mineur (pratique, soins, transport, sortie seule).
- Recalcule `dossier_status` après modification des consentements.
- Bouton **Modifier** dans la fiche détail (les deux écrans) ; la liste se met à jour immédiatement.

## Transmission différée des documents (2026-07-24)

- **Besoin** : permettre à l'adhérent de revenir **quelques jours/semaines** après l'inscription pour transmettre les **documents manquants** (certificat médical, photo), sans compte. L'engagement « sous 3 semaines » reste inchangé.
- **Mécanisme** : **lien personnel sécurisé par jeton** (aucun login).
  - Migration `20260724120000_inscription_documents_token.sql` : colonne `documents_token uuid unique default gen_random_uuid()` (attribuée aussi aux inscriptions existantes). **⚠️ à pusher au déploiement.**
  - Jeton **généré côté client** à l'inscription et inséré (le RLS anonyme n'autorise pas la relecture après insert).
- **Page publique** `/mon-inscription/[token]` (Server Component + `DocumentsClient`) : statut de chaque doc (Transmis / À fournir) + upload des manquants. `noindex`. Upload direct vers Storage (bucket `inscriptions`) puis server action `submitInscriptionDocumentAction` (jeton = authentification) qui met à jour l'URL, désactive l'engagement, recalcule Finalisé, revalide l'admin.
- **Email (Option A retenue)** : `lib/email/inscription.ts` + `notifyInscriptionCreatedAction` envoient à l'adhérent le lien « complétez vos documents » (non bloquant). **Nécessite domaine vérifié Resend + `CONTACT_FROM_EMAIL` (Vercel).**
- **Confirmation** `/inscription/paiement-en-attente` : section « Documents à compléter » avec le lien (jeton passé en query).
- **Admin** : fiche inscription → `DocumentsLinkBox` affiche le lien personnel (copiable) pour le renvoyer à l'adhérent. `documents_token` ajouté au select admin + types.
- **Décision produit** : pas de champ « autre document » pour l'instant (uniquement certificat + photo).
- **Au déploiement** : (1) `npm run db:push` pour la migration ; (2) vérifier le domaine dans Resend + définir `CONTACT_FROM_EMAIL` et `NEXT_PUBLIC_SITE_URL` sur Vercel.

## FAQ page d'accueil + SEO (2026-07-24)

- Nouvelle section **Questions fréquentes** en bas de la page d'accueil (`components/FaqSection.tsx`, insérée dans `app/page.tsx` avant le CTA final).
- **7 questions** couvrant 3 profils : novice en MMA, curieux du club, futur adhérent (c'est quoi le MMA, débutants/enfants, âge dès 3 ans, équipement, cours d'essai offert, lieux/horaires La Queue-en-Brie 94, tarifs 200-300 €/an + paiement au club).
- **SEO** : balisage **JSON-LD `FAQPage`** (rich results Google) + mots-clés locaux ; accordéon natif `<details>` (accessible, sans JS, Server Component).
- CTA « S'inscrire » / « Poser une question » sous la FAQ.

## Fix publication actualités — écran d'erreur client (2026-07-24)

- **Symptôme** : en prod, la publication d'une actualité (avec photo) provoquait « Application error: a client-side exception » (écran noir).
- **Cause** : Next.js 16 limite le body des **Server Actions à 1 Mo** par défaut. Une photo > 1 Mo faisait rejeter la requête *avant* l'exécution de l'action (donc non attrapable par le `try/catch`), et l'absence d'error boundary produisait l'écran noir.
- **Correctifs** :
  - `next.config.mjs` → `experimental.serverActions.bodySizeLimit: '4mb'` (marge sous la limite plateforme Vercel ~4,5 Mo).
  - `app/admin/error.tsx` : error boundary admin → message lisible + « Réessayer » au lieu de l'écran noir (bénéficie à toutes les actions admin).
  - Garde-fou client dans `AdminCreatePostForm` / `AdminEditPostForm` : blocage du bouton + message si poids total des photos > 3,8 Mo.
  - `lib/admin/upload-post-image.ts` : `MAX_BYTES` aligné à 4 Mo.
  - `package.json` : `next` / `react` / `react-dom` **épinglés** (16.1.6 / 19.2.4) au lieu de `latest` (évite un upgrade cassant au redéploiement).
- **À surveiller / suite possible** : mêmes limites pour les **documents d'inscription** (certificats PDF volumineux) et les **galeries multi-photos** de compétition (total > 3,8 Mo impossible via Server Action sur Vercel). Solution robuste = **upload direct client → Supabase Storage** (l'action ne recevrait que les URLs). À planifier si besoin de gros volumes.

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
