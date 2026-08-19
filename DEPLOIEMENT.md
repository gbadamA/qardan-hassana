# Déploiement — Vercel (forfait gratuit) + Supabase

> État au 2026-08-15 : **le code est prêt, l'infrastructure ne l'est pas encore.**
> Deux verrous, tous deux côté compte, aucun côté code. Ils sont décrits ci-dessous
> avec la marche à suivre exacte.

---

## Verrou 1 — Supabase : plafond du forfait gratuit atteint

Le forfait gratuit Supabase autorise **2 projets actifs par organisation**. L'organisation
`gbadamA's Org` en compte déjà deux :

| Projet | État |
|---|---|
| `systemcollaboratif` | actif |
| `preventix-360` | actif |
| `ventespro-crm` | **en pause** (ne compte pas) |

La création d'un troisième projet est refusée. Le coût d'un projet supplémentaire a été
vérifié : **0 €/mois** — ce n'est donc pas une question d'argent, mais de quota.

**Trois issues possibles**, à trancher par vous :

1. **Mettre en pause un projet existant** (tableau de bord Supabase → projet → Settings →
   Pause). Une base en pause conserve ses données et se réactive en un clic.
2. **Réutiliser une base existante** en y ajoutant les 7 migrations de ce projet, sous un
   schéma dédié. Déconseillé : la RLS et les rôles seraient partagés avec l'autre produit.
3. **Passer l'organisation au forfait Pro** (25 $/mois) — hors de votre demande.

Une fois un emplacement libéré :

```bash
# depuis la racine du projet
supabase link --project-ref <REF_DU_NOUVEAU_PROJET>
supabase db push          # applique les 7 migrations
supabase functions deploy create-member
```

⚠️ **Ne pas exécuter `supabase/seed.sql` en production** : il crée des comptes dont les
mots de passe sont en clair dans le fichier. Créez le premier compte administrateur à la
main dans le tableau de bord Supabase (Authentication → Add user), puis insérez sa ligne
dans `profiles` avec le rôle `super_admin` ; tous les autres comptes se créeront ensuite
depuis l'écran Administration.

---

## Verrou 2 — Vercel : le connecteur ne peut pas créer de projet

Le connecteur Vercel de cette session est en **lecture seule** : il liste les projets et
les déploiements, mais la création répond `403 forbidden`. Le CLI, lui, est déconnecté et
sa connexion passe par un navigateur, impossible à automatiser ici.

➜ **L'import se fait donc depuis l'interface Vercel**, une fois par application.

### Site public

| Réglage | Valeur |
|---|---|
| Import | `gbadamA/qardan-hassana` |
| Project Name | `qardan-hassana-site` |
| Framework | Next.js (détecté) |
| **Root Directory** | `apps/site` |
| Install / Build | laisser les valeurs par défaut |

> Vercel détecte le workspace pnpm et installe depuis la racine du dépôt. Ne pas cocher
> « Skip dependency installation », les paquets `@qardan/*` en dépendent.

### Back-office

Même import, avec :

| Réglage | Valeur |
|---|---|
| Project Name | `qardan-hassana-dashboard` |
| **Root Directory** | `apps/dashboard` |

> Le back-office est protégé par l'authentification Supabase et la RLS, pas par une
> protection d'accès Vercel (réservée aux forfaits payants). Son `vercel.json` envoie un
> en-tête `X-Robots-Tag: noindex` pour qu'il ne se retrouve pas dans les moteurs.

---

## Variables d'environnement

À renseigner dans **Settings → Environment Variables** de chaque projet Vercel, pour les
trois environnements (Production, Preview, Development).

### Communes aux deux applications

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | même écran → `anon` `public` |
| `NEXT_PUBLIC_CONTACT_PCA_NAME` | ⚠️ voir `.env.local` (jamais versionné) |
| `NEXT_PUBLIC_CONTACT_PCA_PHONE` | format `+225XXXXXXXXXX` |
| `NEXT_PUBLIC_CONTACT_SECRETAIRE_NAME` | |
| `NEXT_PUBLIC_CONTACT_SECRETAIRE_PHONE` | |
| `NEXT_PUBLIC_CONTACT_TRESORIER_NAME` | |
| `NEXT_PUBLIC_CONTACT_TRESORIER_PHONE` | |
| `NEXT_PUBLIC_ORG_EMAIL` | `contact@qardanhassana.ci` |

### Site uniquement

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | l'URL finale, ex. `https://qardanhassana.ci` |

⚠️ `NEXT_PUBLIC_SITE_URL` sert aux URL canoniques, aux balises `hreflang` et au sitemap.
Une valeur fausse dégrade le référencement sans provoquer la moindre erreur visible —
c'est la variable qu'on oublie et qu'on ne voit jamais manquer.

⚠️ Ces variables sont lues **au moment du build**, pas à l'exécution. Après toute
modification, il faut **redéployer** ; changer la valeur ne suffit pas.

---

## Ce qui fonctionne sans Supabase

Le site se déploie et s'affiche entièrement : les 45 pages sont pré-rendues et le contenu
vient de fichiers. Seules les **écritures** ont besoin de la base.

Sans `NEXT_PUBLIC_SUPABASE_URL`, les trois formulaires (don, contact, bénévolat) refusent
proprement avec un message traduit qui invite à téléphoner. Ils ne provoquent pas d'erreur
serveur : le repli « fichier » est désactivé en production, parce qu'un hébergement sans
disque persistant le ferait échouer au pire moment — juste après la saisie d'un don.

Le back-office, lui, affiche « Supabase non configuré » sur sa page de connexion.

---

## Après la mise en ligne

1. Basculer `IS_DEMO_CONTENT` à `false` dans `apps/site/content/shared.ts` **une fois les
   vrais contenus saisis** — le bandeau « Maquette de travail » disparaîtra.
2. Brancher la page Transparence sur `public_documents()` (les documents publiés au
   back-office remplaceront les rapports factices).
3. Trancher les points ouverts du §1 de `claudemap.md` : orthographe du nom, logo en PNG
   transparent, adresse du siège, numéro Mobile Money de l'ONG.
