# ONG Qardan Hassana — plateforme numérique

> *« Pour la bonne cause »*

Monorepo de la plateforme de l'ONG Qardan Hassana (Abidjan, Côte d'Ivoire) :
**site vitrine public** + **dashboard back-office** + **application mobile**.

📍 **Commencer par [`claudemap.md`](./claudemap.md)** — carte maîtresse du projet (DA, décisions verrouillées, pièges, ordre de bataille).
Les specs client d'origine sont dans [`cahier-des-charges.md`](./cahier-des-charges.md).

---

## Démarrage

```bash
pnpm install

# Base de données (Docker requis)
npx supabase@latest start      # API sur 54141, Studio sur 54143
npx supabase@latest db reset   # rejoue migrations + seed

pnpm site        # site vitrine  → http://localhost:3040
pnpm dashboard   # back-office   → http://localhost:3041
pnpm typecheck
```

**Comptes de test** (mot de passe `qardan1234`) : `pca@qardan.ci`, `tresorier@qardan.ci`,
`commissaire@qardan.ci` (lecture seule), `direction@qardan.ci`, `social@qardan.ci`
(responsable de programme — ne voit que le Social).

> ⚠️ `pnpm install` prend une quinzaine de minutes sur ce poste. C'est normal, ne pas interrompre.

## Structure

```
apps/
  site/         ✅ Next.js 15 — site vitrine public (port 3040)
  dashboard/    ✅ Next.js 15 — back-office (port 3041)
  mobile/       🟢 Expo SDK 54 — socle livré (Accueil, Programmes, Actualités, Don, Réglages)
packages/
  design-tokens/ ✅ la DA, partagée par les trois briques
  shared/        ✅ i18n (FR/AR) + dictionnaires, organisation, programmes, dons, formulaires, rôles
  supabase/      ✅ client typé + types de la base
supabase/        ✅ migrations SQL + seed de développement
```

## État actuel

| Brique | État |
|---|---|
| Site vitrine (12 pages × 2 langues, don, bénévolat, contact, SEO) | ✅ livré **bilingue FR/AR**, typecheck 0 erreur, build OK (45 pages), vérifié dans le navigateur |
| Back-office (7 écrans × 2 langues, RLS par rôle) | ✅ livré, typecheck 0 erreur, build OK (16 pages), vérifié dans le navigateur |
| Base de données Supabase (9 tables + RLS + agrégats) | ✅ 5 migrations, seed de développement, RLS vérifiée rôle par rôle |
| App mobile | 🟢 socle livré — typecheck 0 erreur, bundle Android exporté (4,61 Mo) ; **jamais lancée sur un appareil** |

### ⚠️ Avant toute mise en ligne publique

1. **Remplacer les contenus de démonstration** dans `apps/site/content/` (chiffres, articles, événements, rapports), puis passer `IS_DEMO_CONTENT` à `false` dans `content/shared.ts` — le bandeau d'avertissement disparaîtra.
2. ~~Remplacer `fileSubmissionStore`~~ → **fait** : le site écrit dans Supabase via des fonctions `security definer` (`apps/site/lib/store.ts`). Le stockage fichier ne sert plus que si Supabase n'est pas configuré, pour développer sans Docker.
3. **Trancher les points ouverts** listés au §1 de `claudemap.md` (orthographe du nom, logo transparent, adresse du siège, numéro Mobile Money de l'ONG).

## Conventions

- **Aucun texte affichable en dur** : tout passe par un dictionnaire (`packages/shared/src/dictionaries/` pour le métier, `apps/site/content/<locale>/` pour les pages). Le français est la source de vérité typée — oublier une traduction arabe casse le typecheck.
- **Français par défaut, arabe en option.** La langue est toujours dans l'URL (`/fr/…`, `/ar/…`).
- **Aucune couleur en dur** hors de `packages/design-tokens`.
- **Aucun numéro de téléphone ni nom de responsable en dur** hors de `packages/shared/src/org.ts`.
- Toute validation de formulaire est **rejouée côté serveur** (la validation client n'est qu'un confort).
- Les animations respectent `prefers-reduced-motion`, et le contenu reste lisible sans JavaScript.
