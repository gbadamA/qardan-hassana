# Déploiement — Vercel (forfait gratuit) + Supabase

> État au 2026-08-19 : **la base de données est en ligne et vérifiée.** Reste l'import
> des deux applications sur Vercel, qui doit se faire depuis l'interface web — le
> connecteur de la session est en lecture seule.

---

## Supabase — ✅ fait

| | |
|---|---|
| Projet | `qardan-hassana` |
| Référence | `pbrqenzixxvpwukyextk` |
| Région | `eu-west-3` (Paris) |
| URL | `https://pbrqenzixxvpwukyextk.supabase.co` |
| Forfait | gratuit — 0 €/mois |

Un emplacement a été libéré en mettant `preventix-360` **en pause** (données conservées,
réactivation en un clic depuis le tableau de bord Supabase). Le forfait gratuit plafonne
à 2 projets actifs par organisation.

**Appliqué et vérifié :**

- les 7 migrations → 12 tables, 9 énumérations, 29 policies RLS, 3 policies Storage,
  bucket privé `documents`, 3 tables en Realtime ;
- l'Edge Function `create-member` (version 1, `verify_jwt` activé) ;
- un don anonyme passe par `submit_public_donation` et rend sa référence ;
- un visiteur anonyme **ne peut pas lire** la table `donations` — la RLS tient ;
- un montant sous le minimum est refusé **par la base**, pas seulement par le formulaire.

### Premier compte administrateur

Créé pour amorcer le système — l'Edge Function ne peut pas servir ici, elle exige un
appelant déjà `super_admin`.

| | |
|---|---|
| Identifiant | `admin@qardanhassana.ci` |
| Mot de passe provisoire | **communiqué hors dépôt** — ce fichier est public |
| Rôle | `super_admin` |

⚠️ **À changer dès la première connexion** (Supabase → Authentication → l'utilisateur →
Reset password). Tous les autres comptes se créent ensuite depuis l'écran Administration
du back-office, qui passe par l'Edge Function.

⚠️ **Ne jamais exécuter `supabase/seed.sql` sur cette base** : c'est un jeu de
développement, avec des mots de passe en clair.

---

## Vercel — à importer depuis l'interface

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
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pbrqenzixxvpwukyextk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → clé `anon` `public` (non reproduite ici) |
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

## Piège rencontré — `metadataBase` fait échouer le build (résolu)

Le premier import du **site** a échoué au build, alors que le même commit se construisait
sans erreur en local, sur un clone neuf et sans variables d'environnement. Le journal ne
donnait que le message masqué de production :

```
Error occurred prerendering page "/fr/a-propos".
[Error: An error occurred in the Server Components render. The specific message is
omitted in production builds…] { digest: '3167541878' }
```

Ni fichier, ni ligne, ni cause. Le coupable était `metadataBase: new URL(SITE_URL)` dans
le `generateMetadata` de la mise en page : l'arbre de métadonnées est sérialisé au
pré-rendu, et l'instance `URL` y est la seule valeur qui ne soit pas un objet simple.

La ligne a simplement été retirée : `metadataBase` ne sert qu'à résoudre les URL
*relatives*, et il n'y en a plus une seule — `pageMetadata()` et les icônes construisent
tout à partir de `SITE_URL`. Vérifié en construisant sans : canoniques, `hreflang`,
`og:url` et icônes ressortent identiques, tous absolus.

> Si une URL relative réapparaît un jour dans les métadonnées (une image Open Graph, par
> exemple), il faudra une base : passer alors une **chaîne**, jamais `new URL(...)` — Next
> ne s'en sert que comme second argument de `new URL(url, base)`, et une chaîne se
> sérialise.

### Et un second piège, indépendant : la variable définie mais vide

Après ce correctif, les URL sortaient encore relatives — `<loc>/fr</loc>` dans le sitemap,
`Sitemap: /sitemap.xml` dans `robots.txt`. Cause : `NEXT_PUBLIC_SITE_URL` **existe** sur
Vercel mais **sans valeur**, et `??` ne rattrape que `null` et `undefined`, jamais la chaîne
vide. `SITE_URL` valait donc `""` et tout ce qui en dérivait naissait relatif.

Rien ne se voyait : le site s'affichait parfaitement pendant que chaque page se déclarait
canonique d'elle-même sur l'hôte qui la servait, que les `hreflang` perdaient leur objet, et
que le sitemap devenait formellement invalide (la norme exige des `<loc>` absolues).

`lib/seo.ts` traite désormais une valeur blanche comme absente et retire la barre oblique
finale. ➜ **Renseigner tout de même la variable pour de bon** : le repli est un domaine
codé en dur, pas une adresse choisie.

> Le back-office, lui, n'a jamais eu de `metadataBase` — c'est pour cela que lui seul se
> construisait dès le premier import.

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
