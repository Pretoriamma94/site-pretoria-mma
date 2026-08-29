# Déploiement — Pretoria MMA (Vercel)

Checklist à suivre le jour de la mise en ligne. À faire **dans l'ordre**.

> Remplace `pretoriamma94.fr` par le nom de domaine réellement acheté.

---

## 1. Domaine + hébergement Vercel

1. Créer/ouvrir le projet sur [Vercel](https://vercel.com) et le connecter au dépôt du site.
2. Acheter le nom de domaine (chez Vercel ou un registrar externe : OVH, Gandi…).
3. Dans Vercel : **Settings → Domains** → ajouter `pretoriamma94.fr` et suivre les instructions DNS.
4. Le **certificat HTTPS/SSL est automatique** sur Vercel (rien à installer). Le site sera servi en `https://`.

---

## 2. Variables d'environnement (Vercel → Settings → Environment Variables)

À créer pour l'environnement **Production** (recopier les valeurs depuis `.env.local`).

| Variable | Rôle | Exemple / note |
|----------|------|----------------|
| `NEXT_PUBLIC_SITE_URL` | **URL publique du site** — sert au lien de reset de mot de passe | `https://pretoriamma94.fr` (⚠️ sans `/` final) |
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète (actions admin) | Supabase → Settings → API — **secret** |
| `RESEND_API_KEY` | Envoi des emails (contact, notifications) | Compte Resend |
| `CONTACT_FROM_EMAIL` | Expéditeur des emails (domaine vérifié Resend, pas besoin d'une vraie boîte) | `Pretoria MMA <noreply@pretoriamma94.fr>` |
| `CONTACT_TO_EMAIL` *(optionnel)* | Destinataire des messages de contact | `pretoriamma94@gmail.com` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` *(optionnel)* | Anti-spam formulaire | Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` *(optionnel)* | Anti-spam (serveur) | Cloudflare Turnstile |

> ⚠️ **Ne JAMAIS** définir `ADMIN_AUTH_BYPASS` en production (accès admin sans mot de passe — dev local uniquement).

---

## 3. Configuration Supabase (Authentication → URL Configuration)

1. **Site URL** = `https://pretoriamma94.fr`
2. **Redirect URLs** — ajouter :
   - `https://pretoriamma94.fr/auth/callback`
   - (conserver `http://localhost:3000/auth/callback` pour le développement)

Sans ces réglages, le lien reçu par email pointerait vers la mauvaise adresse.

---

## 4. Première connexion / réinitialisation du mot de passe admin

À faire **une fois** le site en ligne et les étapes 2 et 3 terminées.

1. Aller sur `https://pretoriamma94.fr/admin` → redirection automatique vers la connexion.
2. Cliquer sur **« Mot de passe oublié ou première connexion »**.
3. Saisir l'email admin : `pretoriamma94@gmail.com`.
4. Ouvrir l'email reçu (vérifier les **spams**), cliquer sur le lien.
5. Définir le nouveau mot de passe → se connecter.

Le compte admin (`pretoriamma94@gmail.com`) possède déjà le rôle `admin`. Les gérants gardent l'adresse `https://pretoriamma94.fr/admin` en **favori**.

---

## 5. Vérifications après mise en ligne

- [ ] Le site s'ouvre en `https://` (cadenas dans le navigateur).
- [ ] Pages légales accessibles : `/mentions-legales`, `/politique-confidentialite`, `/cookies`.
- [ ] Le bandeau cookies s'affiche à la première visite.
- [ ] Connexion admin OK après reset du mot de passe.
- [ ] Formulaire de contact → message reçu (table `contact_messages` + email).
- [ ] Une inscription de test arrive bien dans `/admin/inscriptions`.

---

## Notes

- **Emails de reset** : par défaut, service email intégré de Supabase (quotas limités, risque de spam). Suffisant pour démarrer ; pour des emails 100 % fiables au nom du club, brancher un SMTP dédié (ex. Resend) dans Supabase → Authentication → SMTP Settings.
- **En-têtes de sécurité** (HSTS, etc.) : déjà configurés dans `next.config.mjs`, actifs automatiquement en production.
- Projet Supabase actuel : `pipxrkqqaqwoilfnahru`.
