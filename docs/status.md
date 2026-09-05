# Status

## Décisions produit (validées)

- **HelloAsso / paiement en ligne** : le bouton HelloAsso n’est **plus** à l’étape Paiement. L’adhérent choisit seulement le mode ; le paiement HelloAsso se fait **après validation** (page de confirmation + email). Pas besoin de revenir sur le site ensuite.
- **Paiements** : au club — **espèces**, **chèque** ; **paiement en ligne** via HelloAsso. Espèces / chèque : consigne enveloppe fermée (nom-prénom, montant, nombre de chèques) à l’étape Paiement et sur la page de confirmation.
- **Échéances** : possibilité de payer en **1, 2 ou 3 fois** (quel que soit le mode).
- **Choix à l’inscription** : l’adhérent choisit mode + nombre d’échéances (étape Tarifs) ; l’admin enregistre ensuite les montants reçus.
- Compte admin : `pretoriamma94@gmail.com` avec `app_metadata.role = 'admin'`.
- **Mot de passe** : réinitialisation en autonomie via `/admin/login/forgot-password` (e-mail Supabase).
- Première connexion : même lien « Mot de passe oublié ou première connexion » pour choisir un mot de passe personnel.
- Redirect URLs Supabase à autoriser : `http://localhost:3000/auth/callback` (+ URL prod).

## Planning & tarifs 2026-2027 (en cours, local)

- **Baby JJB** : samedi 15h-16h, 200 €.
- **Enfants** : mardi 17h-18h30 (Halles des Violettes) + samedi 16h-17h30 (Coubertin), 250 €.
- **Adolescents** : mardi 18h30-20h MMA + jeudi 18h30-20h grappling (Halles des Violettes), 250 €.
- **Adultes mixte** (homme et femme) : 300 €, accès à tous les cours adultes mixtes (lundi MMA, jeudi grappling, samedi sparring).
- **Section femmes** : 200 €, un créneau samedi 17h30-18h30 MMA/Grappling.
- Inscription : les femmes adultes choisissent mixte 300 € ou section femmes 200 € à l’étape paiement.
- **Fiche admin** : les réponses d’inscription (informations, autorisation parentale / droit à l’image, lu et approuvé) sont visibles sur la fiche adhérent et la fiche inscription ; un **Non** (refus) s’affiche en rouge.
- **Questionnaire de santé (renouvellement)** : seules les attestations sont conservées (pas les réponses individuelles) — « toutes réponses NON » (certificat non requis) ou « au moins un OUI » (engagement certificat). Texte + date + identité du déclarant sur les fiches admin.
- **Scan QS papier (inscription manuelle)** : alerte rouge **uniquement** si l’inscription est papier **et** le certificat n’est pas requis (toutes réponses NON). Pas de scan pour les inscriptions en ligne, ni quand un certificat médical est demandé. Pastille bleue **Inscription manuelle** sur les listes / fiches.
- **Baby JJB / santé** : toujours le questionnaire mineur (1re inscription et renouvellement, pas de question « certificat de moins de 3 ans »). Un OUI → certificat obligatoire (upload ou engagement 3 semaines) ; toutes réponses NON → certificat non requis. Même attestation et mêmes bannières sur les fiches admin que pour un mineur MMA.
- **Certificat sous 3 semaines** : sans fichier, case d’engagement obligatoire pour poursuivre ; admin = décompte J-n puis **alerte** si le délai est dépassé.
- **Photo d’identité** : étape après Santé / avant RGPD-paiement, tous profils (PNG, JPG, PDF ; photo téléphone fond blanc). Sans fichier, engagement 3 semaines + décompte / alerte admin.
- **Rappel des obligations** : case **Lu et approuvé** obligatoire à l’étape Autorisations pour tous les profils (MMA adulte, MMA mineur, Baby JJB) avant de poursuivre.
- **Charte du club** : étape obligatoire avant le paiement (tous profils, y compris Baby JJB) — lecture / téléchargement du PDF + 3 cases (lu, règles, engagement).

## Reçu de cotisation par email (2026-09-04)

- Le reçu part **dès que la cotisation est soldée** (plus seulement au statut Finalisé). Un dossier peut être Payé sans être Finalisé (papiers manquants) : le reçu est quand même envoyé.
- Bouton **Envoyer le reçu par email** sur chaque fiche (adulte, enfant, baby) dès qu’une part &gt; 0 €, y compris pack family.
- Document associatif (loi 1901, hors TVA) — ce n’est pas une facture commerciale.
- Enfant pack family à 0 € : le reçu est sur la fiche du **payeur** du pack (parent ou enfant).

## Fiche inscription — Modifier (2026-09-04)

- **Inscriptions** : **Modifier** et **Détails** ouvrent la **fiche complète éditable** (identité, montant, consentements, pack family, paiement, documents). **Annuler** / **Enregistrer** restent visibles ; après enregistrement ou annulation, la fiche se ferme.

## Pack family admin (2026-09-04)

- Le parcours d’inscription public reste inchangé (1 personne à la fois).
- **Admin fiche inscription / adhérents** : case **Pack family**.
  - **Payeur du pack** (adulte **ou** enfant) : montant de **sa part** + sélection des enfants / baby / ado. Chaque enfant peut avoir une part &gt; 0 € (reçu distinct) ou 0 € (inclus).
  - **Enfant relié avec une part** : paiement et reçu sur **sa propre fiche**.
- **Inscription publique** : encart dès la 1re étape — packs famille / réductions, se rapprocher des membres de l’association (pas de choix du pack en ligne).
- Badge **Pack family** (listes + fiches). Incompatible avec « membre du bureau ».
- Recettes club : le tarif pack est sur le payeur (adulte ou enfant) ; les membres reliés à 0 € ne doublent pas le CA.
- Migration `20260904170000_pack_family.sql` (`pack_family_parent_id`) **appliquée** sur le remote le 2026-09-04. Repli JSON dans `membre_2` conservé en secours.

## HelloAsso après validation (2026-09-05)

- L’étape Paiement du wizard : choix du mode seulement (pas de bouton HelloAsso).
- Après « Valider ma pré-inscription » : page de confirmation + email avec le lien HelloAsso. L’adhérent n’a pas à revenir sur le site.
- Page `/inscription/helloasso-retour` : remercie et renvoie à l’accueil (plus vers le formulaire).

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
- **Marquage paiement** : modal « Enregistrer un paiement » (espèces / chèque / paiement en ligne HelloAsso, 1–3 fois, montant reçu, n° d’échéance, référence) — inscriptions, soldes, et fiche adhérent.
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
- Formulaire aligné sur l’inscription en ligne (identité, consents, santé/QS, charte, paiement). Pas de taille de tenue.
- À la validation : **même email de confirmation** qu’en ligne (`notifyInscriptionCreatedAction`) vers l’email saisi.
- Statut auto : `paid` si soldé à la saisie, sinon `pending_payment`.

## Champs adhérent (2026-07-18)

Alignés site + admin papier :

- **Adulte** : prénom, nom, date de naissance, n° + rue, CP, ville, email, téléphone.
- **Mineur (moins de 18 ans)** : prénom, nom, date de naissance, adresse de l’enfant (n° + rue + CP + ville), nom/prénom + téléphone du représentant légal ; téléphone enfant optionnel.
- Migration : `20260718170000_inscription_adresse_mensurations.sql` (`numero_voie`, `rue`, `taille_cm`, `poids_kg`) **appliquée** sur le remote.
- **Split N° / rue (2026-09-05)** : l’adresse saisie en un champ (« 17 rue de Paris » ou « Praça Junqueiro 17 ») alimente `numero_voie` + `rue`. La fiche admin préremplit le N° si l’ancien dossier l’avait tout mis dans la rue.
- **Taille de tenue** : plus utilisée (ni formulaire, ni fiche, ni export). Colonne DB conservée, toujours enregistrée à `null`.

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
- Colonne **Catégorie** dans le tableau ; l’export **CSV** (s’ouvre dans Excel) reprend la sélection affichée, avec **payé**, **reste dû** et **date du dernier paiement**.
- Filtrage basé sur `cours_selectionne` (catégorie d'inscription, alignée sur les tranches d'âge).

## Charte sportive PDF téléchargeable (2026-07-24)

- PDF officiel placé dans `public/documents/charte-sportive-pretoria.pdf`.
- Bouton **Télécharger la charte (PDF)** sur `/charte` + lien **télécharger le PDF** à l'étape Autorisations de l'inscription (à côté de « consulter »).

## Édition profil adhérent admin (2026-07-24)

- Les admins peuvent **corriger / mettre à jour** un profil depuis **Inscriptions** et **Adhérents**.
- Modal partagé `EditProfileModal` + action `updateInscriptionProfileAction` (Zod `editProfileSchema`).
- Champs éditables : identité (nom, prénom, date de naissance, sexe), contact (email, téléphone), adresse, mensurations / taille de tenue, responsable légal (mineur), consentements (RGPD, règlement, charte, assurance), **droit à l'image** (photos site & réseaux), autorisations mineur (pratique, soins, transport, sortie seule).
- **Catégorie de cours (dérogation)** : un adolescent peut être placé en **adultes mixte** (ou section femmes) ; une femme peut passer **section femmes ↔ mixte** (et revenir en ados si encore mineure). Le **tarif de la nouvelle catégorie** s’applique, le déjà payé est conservé.
- Recalcule `dossier_status` après modification des consentements.
- Bouton **Modifier** dans la fiche détail (les deux écrans) ; la liste se met à jour immédiatement.

## Transmission différée des documents (2026-07-24)

- **Besoin** : permettre à l'adhérent de revenir **quelques jours/semaines** après l'inscription pour transmettre les **documents manquants** (certificat médical, photo), sans compte. L'engagement « sous 3 semaines » reste inchangé.
- **Mécanisme** : **lien personnel sécurisé par jeton** (aucun login).
  - Migration `20260724120000_inscription_documents_token.sql` : colonne `documents_token uuid unique default gen_random_uuid()` (attribuée aussi aux inscriptions existantes). **⚠️ à pusher au déploiement.**
  - Jeton **généré côté client** à l'inscription et inséré (le RLS anonyme n'autorise pas la relecture après insert).
- **Page publique** `/mon-inscription/[token]` (Server Component + `DocumentsClient`) : statut de chaque doc (Transmis / À fournir) + upload des manquants. `noindex`. Upload direct vers Storage (bucket `inscriptions`) puis server action `submitInscriptionDocumentAction` (jeton = authentification) qui met à jour l'URL, désactive l'engagement, recalcule Finalisé, revalide l'admin.
- **Email (Option A retenue)** : `lib/email/inscription.ts` + `notifyInscriptionCreatedAction` envoient à l'adhérent le lien « préinscription confirmée + documents ». **Nécessite domaine vérifié Resend + `CONTACT_FROM_EMAIL` (Vercel).** Copie **BCC** vers `pretoriamma94@gmail.com` (2026-09-05).
- **Fix 2026-07-24** : l'email était lancé en fire-and-forget puis la redirection annulait la Server Action → aucun envoi. Correction : **await** avant redirect + statut `emailSent` sur la page confirmation. Admin : bouton **Renvoyer l'email** dans `DocumentsLinkBox`.
- **Confirmation** `/inscription/paiement-en-attente` : section « Documents à compléter » avec le lien (jeton passé en query) + feedback email envoyé / non envoyé.
- **Admin** : fiche inscription → `DocumentsLinkBox` (copier le lien + renvoyer l'email). `documents_token` ajouté au select admin + types.
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
- **CTA S'inscrire mobile (2026-09-05)** : bouton visible dans la barre (à côté du menu) + premier bouton du hero accueil. Desktop inchangé (CTA toujours dans la nav).
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
- **Fix 2026-09-04** : enregistrement d’un paiement (dont la **date de réception**) échouait avec `column inscriptions.questionnaire_sante does not exist`. Les SELECT admin relancent sans les colonnes absentes. Migrations QS / bureau / pack family **poussées** sur le remote (`pipxrkqqaqwoilfnahru`) le 2026-09-04.
- **Membre du bureau** : persisté via `type_tarif = 'bureau'` (cotisation 0, hors CA) **et** colonne `membre_bureau` (migration `20260904140000_membre_bureau.sql` appliquée).
- **Pack family** : `inscription_familiale` + `type_tarif = 'familial'` + lien parent/enfants (`pack_family_parent_id`, migration `20260904170000_pack_family.sql` **appliquée**). Repli JSON dans `membre_2` conservé en secours.

## Comment tester
2. `/inscription` → étape Paiement : choisir le mode (sans bouton HelloAsso) → valider le récap → confirmation affiche le choix ; si paiement en ligne, bouton HelloAsso **après** validation
3. `/admin` → login `pretoriamma94@gmail.com`
4. Accueil : tuiles réelles (Inscriptions, Paiements, Contact, Actualités)
5. Inscriptions : filtrer / rechercher ; **+ Inscription papier** ; **Enregistrer un paiement** (montant reçu)
6. Paiements / Soldes : vérifier les restes dus
7. `/contact` : envoyer un message → `/admin/contact` → marquer traité
8. Actualités : créer / publier depuis `/admin/actualites`
