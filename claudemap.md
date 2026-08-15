# 🤝 CLAUDEMAP — ONG Qardan Hassana

> Carte maîtresse du projet. **À lire en priorité au démarrage de chaque session.**
> Elle définit **quoi** construire, **avec quelle stack**, **dans quel ordre**, et surtout **à quoi ça doit ressembler**.
> Les specs fonctionnelles d'origine (fournies par le client) sont dans `cahier-des-charges.md` — ne pas les réécrire, les compléter ici.

---

## 1. Identité du projet

| | |
|---|---|
| **Nom de travail** | QARDAN HASSANA |
| **Organisation** | ONG Qardan Hassana — organisation non gouvernementale ivoirienne |
| **Devise** | *« Pour la bonne cause »* |
| **Cadre légal** | Loi n° 60-315 du 21 septembre 1960 relative aux Associations (CI) — apolitique, à but non lucratif |
| **Type** | Site vitrine public + Dashboard back-office + App mobile |
| **Cible** | Grand public & donateurs (site + mobile), Conseil d'Administration & staff (dashboard) |
| **Marché** | Côte d'Ivoire / Abidjan |
| **Langue produit** | **Français (par défaut) + arabe** — décision client du 2026-08-07, voir §3 bis |
| **Contraintes locales** | Mobile Money, faible data, 3G, WhatsApp roi, majorité des visiteurs sur téléphone |
| **Statut** | 🟢 **Phase 2 (site) et Phase 1 (back-office + Supabase) livrées, bilingues FR/AR** · 🔴 Phase 3 (mobile) non commencée |

**Promesse produit :** un site qui donne envie de donner *parce qu'on comprend où va l'argent*.
Sobriété, dignité, traçabilité — jamais de misérabilisme, jamais de chiffre invérifiable.

### ⚠️ Décisions verrouillées (ne pas ré-ouvrir sans demande explicite)

1. **Architecture clonée de `projets/mosquee-fitia/`** — demande explicite de l'utilisateur. Monorepo pnpm, `packages/design-tokens` comme source visuelle unique, preset Tailwind partagé site ↔ dashboard ↔ mobile. En cas de doute sur un pattern, **lire `projets/mosquee-fitia/`** (lui-même dérivé de `projets/asso-jeunes/`).
2. **Le don est une PREUVE, pas un appel d'API.** Aucun encaissement en ligne tant que l'ONG n'a pas de compte marchand. Le donateur déclare, le Trésorier valide au back-office. Le port `PaymentGateway` (`packages/shared/src/donation.ts`) fige le contrat pour brancher CinetPay / Orange Money plus tard sans réécrire le formulaire.
3. **Thème clair ET sombre atteignables dès le premier jour.** Leçon de mosquee-fitia : les tokens `light-*` y étaient câblés partout mais le layout forçait `class="dark"` — le mode clair n'a jamais pu être testé. Ici le sélecteur existe (`lib/theme.tsx` + `ThemeToggle`) et le défaut suit la préférence système.
4. **Aucun contenu inventé présenté comme réel.** Tous les chiffres/articles/rapports actuels sont des placeholders explicitement marqués, et un bandeau d'avertissement s'affiche sur le site tant que `IS_DEMO_CONTENT === true`.
5. **Pas de framer-motion sur le site vitrine.** Animations en CSS + IntersectionObserver (`lib/reveal.ts`). Le visiteur type est en 3G sur téléphone : chaque kilo-octet de JS se paie.
6. **Bilingue français / arabe, français par défaut** (demande client du 2026-08-07). Vaut pour les TROIS briques : site, dashboard, mobile. Architecture en §3 bis. Ne pas ajouter de texte en dur dans un composant — tout passe par un dictionnaire.

### ⚠️ Points à trancher avec le client (bloquants pour la mise en ligne)

| Sujet | État |
|---|---|
| **Orthographe du nom** | Le cahier écrit « Qardan Hassana », le logo « QARDANE HASSANA ». Centralisé dans `ORG.name` (`packages/shared/src/org.ts`) — une seule ligne à changer. |
| Logo en PNG transparent ou SVG | Actuellement un JPEG à fond blanc → obligé de le poser dans une pastille blanche. |
| Adresse exacte du siège | `ORG.address` est un placeholder ; la carte de la page Contact est volontairement remplacée par un cadre d'attente (un plan faux est pire que pas de plan). |
| Numéro Mobile Money de l'ONG | Les instructions de don disent « le numéro de l'ONG » sans le donner. |
| Contenus réels | Photos, chiffres de bénéficiaires, rapports PDF, historique de l'ONG. |
| Équivalences d'impact | `impactOf()` donne des ordres de grandeur (« 5 000 F = un panier alimentaire ») **à valider par la Direction Exécutive** avant publication. |

---

## 2. Stack technique (verrouillée)

> Reprise fidèle de l'architecture **mosquee-fitia** : même monorepo, même découpage de packages.
> Ce qui change : la DA, le domaine métier, et l'ajout d'une 3ᵉ brique (le site vitrine public).

### Site vitrine — `apps/site` ✅ LIVRÉ
| Rôle | Choix |
|---|---|
| Framework | **Next.js 15** (App Router) + React 19 |
| Rendu | **Statique** (SSG) partout où c'est possible — SEO + hébergement bon marché |
| Styling | **Tailwind CSS 3.4** via le preset partagé |
| Polices | `next/font/google` — Plus Jakarta Sans (titres) + Inter (texte), `display: swap` |
| Animations | **CSS + IntersectionObserver maison** (pas de librairie) |
| Icônes | **Lucide** (`lucide-react`), table d'icônes explicite pour ne pas embarquer les 1500 |
| Formulaires | **Server Actions** + `useActionState` + validation **Zod rejouée côté serveur** |
| Port | **3040** (3030 = ouatt-telecom, 3031 = mosquee-fitia) |

### Dashboard back-office — `apps/dashboard` ✅ LIVRÉ (Phase 1)
| Rôle | Choix |
|---|---|
| Framework | **Next.js 15** + React 19 + Tailwind (même preset, même DA) |
| Bilingue | FR/AR avec RTL, même mécanique que le site (`app/[locale]/`, dictionnaire `content/{fr,ar}.ts`) |
| Données | **Supabase** — client typé `@qardan/supabase`, lecture via un crochet `useQuery` maison |
| Graphiques | **SVG maison** — pas de Recharts (install trop lente sur ce réseau, leçon asso-jeunes) |
| Temps réel | Realtime sur `donations` : un don du site apparaît sans rafraîchir |
| Port | **3041** |

### App mobile — `apps/mobile` 🟢 SOCLE LIVRÉ (Phase 3)
| Rôle | Choix |
|---|---|
| Framework | **Expo SDK 54** (pas 57 : bundle Metro cassé chez asso-jeunes) — RN 0.81.5, expo-router 6.0.24 |
| Styling | **NativeWind v4** avec le même preset ; props natives (dégradés, couleurs) via les objets JS de `@qardan/design-tokens` |
| Animations | Reanimated 4.1.7 + `react-native-worklets` (peer) |
| Hors connexion | `lib/cache.ts` — AsyncStorage : le cache s'affiche d'abord, le réseau rafraîchit, drapeau `stale` si le réseau tombe |
| Écrans | Accueil, Programmes, Actualités, Don, Réglages |
| Test | Émulateur Android Studio ou Expo Go — cf. `standard-mobile-react-expo` |

> ⚠️ **`extra.supabaseUrl` dans `app.json`** : `http://10.0.2.2:54141` pour l'émulateur Android
> (alias stable vers l'hôte). Pour un téléphone réel via Expo Go, mettre l'IP Wi-Fi du poste —
> **qui change au redémarrage**. Après toute modification, RELANCER Expo : les valeurs sont
> figées dans le bundle.

> ⚠️ **Le RTL natif n'est pas le RTL du web.** `I18nManager.forceRTL()` ne prend effet qu'au
> **redémarrage du processus** : basculer en arabe à chaud donne une interface moitié LTR,
> moitié RTL. `lib/locale.tsx` enregistre la préférence, demande le basculement et **prévient
> l'utilisateur** que l'app doit redémarrer. Pas de `RNRestart` : il ne marche pas dans Expo Go
> et une app qui se tue passe pour un plantage.

> ⚠️ **Versions natives** : ne JAMAIS épingler à la main. Toujours `npx expo install` / `expo install --fix`.
> Babel : plugin `react-native-worklets/plugin` (**pas** `react-native-reanimated/plugin`), en dernier.

### Backend — **Supabase** ✅ LIVRÉ (Phase 1)
| Rôle | Choix |
|---|---|
| Base | PostgreSQL managé + **RLS par rôle** (les 7 rôles de `packages/shared/src/roles.ts`) |
| Auth | Email + mot de passe (staff), OTP SMS (donateurs mobile) |
| Diffusion | **Realtime** : le dashboard publie une actualité → site et mobile la reçoivent |
| Fichiers | Storage (photos d'activité publiques, justificatifs **privés**) |
| Logique serveur | Edge Functions (Deno) : `create-member`, `send-push`, génération de reçus |
| **Ports locaux** | **5414x** (54141 API, 54142 db, 54143 studio) — 5412x = asso-jeunes, 5413x = mosquee-fitia |

> ⚠️ Le CLI Supabase **n'est pas installé** sur ce poste → passer par `npx supabase@latest …`,
> sans pipe PowerShell (la bufferisation donne l'illusion d'un blocage de 10 min).

---

## 3. Direction artistique — « Vert d'entraide »

Palette lue **directement sur le logo** : anneau vert vif, cœur vert profond dégradé, silhouettes blanche et noire.
Source unique : `packages/design-tokens/src/index.ts` + `tailwind-preset.js`. **Aucune couleur en dur ailleurs.**

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0F5C2E` | Vert profond — actions, liens, fonds de section |
| `leaf` | `#2E9B4F` | Vert vif du logo — surlignes, icônes, focus |
| `accent` | `#E0A33E` | Sable doré — **uniquement** le don et les chiffres clés |
| `ink` | `#0B1410` | Noir de la silhouette — typographie |
| Dégradé signature | `#062B18 → #0F5C2E → #2E9B4F` (135°) | Hero, bandeaux, pieds de page |

**Une couleur par programme** (comme les couleurs de prière chez mosquee-fitia) :
Social `#0F5C2E` · Environnement `#2E9B4F` · Éducation `#1D4E89` · Santé-Sport `#C2410C`.
Elles teintent les cartes, les filtres d'actualités, les bandeaux de page programme et les blocs date de l'agenda.

**Règles de contraste :** le sable ne porte QUE du texte encre ; le vert profond QUE du texte blanc.

**Motifs :** trame de losanges `pattern-weave` (SVG data-URI, zéro requête réseau) sur les fonds verts,
`pattern-dots` sur les fonds clairs. Rappel de l'anneau du logo.

**Micro-interactions :** soulèvement des cartes au survol (`.lift`), révélation au défilement (`[data-reveal]`),
compteurs animés. **Tout est désactivé sous `prefers-reduced-motion: reduce`**, et le contenu reste visible sans JS.

---

## 3 bis. Bilinguisme français / arabe

**Décision client (2026-08-07) : le site, le dashboard et le mobile doivent pouvoir s'afficher en
français ou en arabe, le français étant la langue par défaut.**

### Règles

1. **La locale est dans l'URL** (`/fr/…`, `/ar/…`), jamais dans un cookie seul. Sans segment de
   langue, Google n'indexe qu'une version et le référencement local — exigence du cahier — s'effondre.
   C'est aussi ce qui rend un lien partageable dans la bonne langue par WhatsApp.
2. **Pas de détection automatique.** `/don` redirige vers `/fr/don`, point. Un téléphone configuré
   en arabe ne signifie pas que son propriétaire préfère lire l'arabe en Côte d'Ivoire, et une
   redirection surprise casse les liens partagés. Le visiteur bascule lui-même.
3. **Aucun texte affichable dans le code métier.** `packages/shared` ne contient plus ni nom de
   programme, ni libellé d'opérateur, ni message d'erreur : uniquement des identifiants et des
   **clés**. Les schémas Zod renvoient `errors.phone.invalid`, traduit à l'affichage — c'est ce qui
   permet à la même Server Action de servir le site FR, le site AR et demain le mobile.
4. **Le français est la source de vérité typée.** `Dictionary = typeof fr` et `SiteUi = typeof uiFr` :
   ajouter une clé en français rend l'arabe incomplet **au typecheck**. On ne peut pas oublier une
   traduction en silence.
5. **Une chaîne manquante retombe sur le français**, jamais sur une clé technique à l'écran.

### Où vivent les textes

| Fichier | Contenu | Partagé avec |
|---|---|---|
| `packages/shared/src/i18n.ts` | Locales, sens de lecture, formatage nombres/dates/monnaie, `localePath`, `switchLocalePath` | dashboard + mobile |
| `packages/shared/src/dictionaries/{fr,ar}.ts` | Métier : identité ONG, rôles, programmes, opérateurs, erreurs, libellés de champs | dashboard + mobile |
| `apps/site/content/{fr,ar}/ui.ts` | Textes des pages du site | site seul |
| `apps/site/content/{fr,ar}/content.ts` | Éditorial (articles, valeurs, témoignages, détail des programmes) | site seul |
| `apps/site/content/shared.ts` | Ce qui **ne se traduit pas** : dates, slugs, couleurs, pourcentages | — |

### Décisions de rendu

- **`dir` et `lang` posés côté serveur** dans `app/[locale]/layout.tsx` (qui EST le layout racine) :
  aucun clignotement ni saut de mise en page. Le middleware garantit qu'aucune URL n'y échappe.
- **Polices arabes dédiées** — Noto Kufi Arabic (titres) + Noto Naskh Arabic (texte). Inter et Plus
  Jakarta Sans n'ont aucun glyphe arabe ; sans ça le navigateur retombe sur une police système au
  rendu imprévisible. Bascule par la classe `locale-ar` sur `<html>`.
- **Propriétés logiques Tailwind partout** (`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-end`)
  plutôt que `ml-`/`left-`. Les chevrons et flèches sont retournés explicitement (`rtl:rotate-180`).
- **L'italique est neutralisée en arabe** : elle n'existe pas dans cette typographie, elle y produit
  une déformation mécanique du glyphe. L'interlettrage négatif des titres l'est aussi.
- ⚠️ **Les nombres suivent la convention monétaire ivoirienne, pas la langue.** Chiffres occidentaux
  et milliers séparés par une espace (« 5 000 fr »), y compris en arabe : un reçu « ٥٠٠٠ » ou
  « 5,000 » ne ressemble à aucun SMS Orange Money. Classe `.ltr-nums` sur tout nombre, référence de
  don ou numéro de téléphone, sinon « DON-2026-0001 » s'affiche à l'envers dans une page RTL.
- **`hreflang` sur chaque page + sitemap bilingue.** Sans ça, un site bilingue se référence MOINS
  bien qu'un site monolingue (contenu dupliqué).

### Reste à faire sur le bilinguisme

- **Relecture par un arabophone** — les traductions sont de l'arabe standard moderne écrit ici, pas
  validées par un locuteur natif du contexte ivoirien.
- Quand l'ONG fournira ses vrais contenus : prévoir **un champ par langue** dans le back-office,
  et non une traduction automatique.

---

## 4. Découpage du monorepo

```
qardan-hassana/
├── claudemap.md              ← ce fichier
├── cahier-des-charges.md     ← specs client d'origine (ne pas réécrire)
├── apps/
│   ├── site/          ✅ Next.js 15 — site vitrine public (port 3040)
│   ├── dashboard/     ✅ back-office (port 3041)
│   └── mobile/        🔴 Phase 3
└── packages/
    ├── design-tokens/ ✅ DA — index.ts (JS) + tailwind-preset.js (Tailwind/NativeWind)
    ├── shared/        ✅ i18n + dictionnaires {fr,ar} + org, programmes, dons, formulaires, rôles
    └── supabase/      ✅ client typé + `database.types.ts` (écrits à la main)
```

### `packages/shared` — ce qui y vit et pourquoi
| Fichier | Contenu | Pourquoi partagé |
|---|---|---|
| `org.ts` | Nom, devise, cadre légal, **les 3 contacts**, organigramme | Aucun numéro de téléphone en dur dans une page |
| `programs.ts` | Taxonomie des 4 programmes (slug, couleur, actions statutaires) | Le dashboard y rattachera bénéficiaires et dépenses |
| `donation.ts` | Schéma Zod du don, moyens de paiement, `PaymentGateway`, `formatFCFA`, `impactOf` | Le mobile réutilisera le même parcours |
| `forms.ts` | Contact + candidature bénévole, port `SubmissionStore` | Mêmes règles côté client et côté serveur |
| `roles.ts` | Les 7 rôles RBAC du §3 du cahier | Le dashboard s'y appuiera pour ses RLS |

---

## 5. État des lieux — ce qui existe dans `apps/site`

| Page | Route | État |
|---|---|---|
| Accueil | `/[locale]` | ✅ hero, chiffres animés, 4 programmes, échelle d'impact, valeurs, témoignages, actualités, agenda |
| À propos | `/[locale]/a-propos` | ✅ objet statutaire, cadre légal, organigramme visuel, frise, valeurs, bureau |
| Programmes | `/[locale]/programmes` | ✅ les 4 cartes |
| Programme (×4) | `/[locale]/programmes/[slug]` | ✅ SSG — constat, actions détaillées, stats, besoins, actualités et événements liés |
| Actualités | `/[locale]/actualites` | ✅ filtre par programme **via l'URL** (partageable, indexable, marche sans JS) |
| Article | `/[locale]/actualites/[slug]` | ✅ SSG + JSON-LD `NewsArticle` + encart de don contextuel |
| Faire un don | `/[locale]/don` | ✅ formulaire complet + écran de confirmation avec référence `DON-AAAA-NNNN` |
| Événements | `/[locale]/evenements` | ✅ à venir / passés |
| Transparence | `/[locale]/transparence` | ✅ engagements, répartition des fonds (SVG maison), documents, gouvernance |
| Devenir bénévole | `/[locale]/benevole` | ✅ formulaire multi-critères |
| Contact | `/[locale]/contact` | ✅ 3 contacts cliquables (tel + WhatsApp) + formulaire |
| Application mobile | `/[locale]/application` | ✅ présentation, boutons de store **désactivés** (pas de lien mort) |
| 404 | — | ✅ |
| SEO | `sitemap.ts` bilingue + `hreflang`, `robots.ts`, JSON-LD `NGO` | ✅ |

### Ce qui n'est PAS fait (et pourquoi)
- **Aucune base de données.** Les 3 formulaires écrivent dans `.data/*.jsonl` via l'implémentation locale du port `SubmissionStore` (`lib/store.ts`). **Ne fonctionnera pas sur Vercel/Netlify** (pas de disque persistant) → remplacer par Supabase en Phase 1. C'est le seul fichier à réécrire.
- **Aucun envoi d'email/SMS.** Une soumission n'alerte personne pour l'instant.
- **Pas de carte** sur la page Contact tant que l'adresse du siège n'est pas confirmée.
- **Pas de traduction des contenus RÉELS.** L'interface et les contenus de démonstration sont intégralement bilingues, mais quand l'ONG fournira ses vrais articles, il faudra décider **qui écrit l'arabe** : traduire depuis le français donne un texte correct mais impersonnel. Le back-office devra prévoir un champ par langue, pas une traduction automatique.

---

## 5 bis. Back-office (Phase 1) — ce qui existe

### Base de données — `supabase/migrations/`
| Migration | Contenu |
|---|---|
| `20260807100000_init` | 7 enums, 9 tables, RLS complète, `dashboard_stats()`, numérotation `DON-AAAA-NNNN` par trigger + séquence, Realtime |
| `20260807140000_fix_stats_by_program` | ⚠️ correctif : `by_program` partait de `beneficiaries`, donc un programme sans bénéficiaire faisait **disparaître ses dons et ses dépenses** du tableau de bord. On itère désormais sur l'énumération des programmes |
| `20260807150000_restrict_beneficiaries` | ⚠️ correctif : `is_staff()` laissait le **Commissaire aux Comptes lire les dossiers médico-sociaux nominatifs**. Son mandat porte sur les comptes ; nouvelle fonction `can_read_beneficiaries()` |
| `20260807160000_public_submissions` | `contact_messages` + `volunteer_applications` (le site n'écrit plus dans un fichier) |
| `20260807170000_public_submit_rpc` | ⚠️ correctif : les écritures publiques passent par des fonctions `security definer` — voir ci-dessous |

### ⚠️ Trois pièges de RLS rencontrés, à ne pas redécouvrir

1. **`insert().select()` échoue pour un visiteur anonyme.** Le site insérait un don puis relisait la ligne pour afficher la référence. L'écriture était autorisée, la RELECTURE non (un anonyme n'a aucun droit de lecture sur `donations` — sinon il verrait les coordonnées de tous les donateurs). PostgREST renvoie alors le message trompeur *« new row violates row-level security policy »*. ➜ Les soumissions publiques passent par `submit_public_donation()` / `submit_contact_message()` / `submit_volunteer_application()`, qui ne renvoient **que la référence**. Les policies d'INSERT public et les GRANT `insert` à `anon` ont été **retirés** : la surface d'écriture publique se limite à ces trois fonctions.
2. **Une policy d'INSERT par rôle ne suffit pas.** La saisie au guichet (le Trésorier enregistre des espèces déjà reçues, donc en statut `valide`) était refusée : la seule policy existante imposait `status = 'en_attente'`. ➜ `donations_finance_insert`.
3. **Les GRANT sont nécessaires EN PLUS de la RLS.** Sans `grant select … to authenticated`, PostgREST répond « permission denied » avant même d'évaluer les policies (leçon asso-jeunes).

### Écrans livrés
| Écran | Contenu |
|---|---|
| Vue d'ensemble | 7 KPI via `dashboard_stats()`, répartition par programme, dons à traiter validables sur place |
| Dons | Filtres par statut, validation/rejet avec n° de transaction, **saisie au guichet**, export CSV, Realtime |
| Finances | Recettes/dépenses/solde, graphique 6 mois en SVG, saisie de dépense, journal unifié, export CSV |
| Bénéficiaires | Liste filtrée + recherche, fiche en tiroir, historique d'assistance, création |
| Activités | Budget alloué vs **dépensé calculé** depuis `expenses` (jamais un cumul stocké), publication à l'agenda du site |
| Communication | Rédaction bilingue, publication/dépublication vers le site, alerte « version arabe manquante » |
| Administration | Comptes + changement de rôle (auto-modification bloquée), journal d'audit |

**Comptes de test** (`supabase/seed.sql`, mot de passe `qardan1234`) :
`pca@qardan.ci` · `tresorier@qardan.ci` · `commissaire@qardan.ci` (lecture seule) · `direction@qardan.ci` · `social@qardan.ci` (ne voit que le programme Social).

### Ce qui reste sur la Phase 1
- **Module Documents (§4.6)** : archivage des statuts, PV, rapports — non commencé.
- **Création de comptes** : exige une Edge Function en `service_role` (un profil ne peut exister sans `auth.users`). L'écran affiche cette limite au lieu d'un bouton qui échouerait.
- **Reçus PDF** et **campagnes de collecte** : tables prêtes (`campaigns`, `campaign_progress()`), écrans à faire.
- **Le site lit encore ses contenus depuis `content/`** : les actualités publiées au back-office sont en base mais le site ne les lit pas encore.

---

## 6. Ordre de bataille

| Phase | Contenu | État |
|---|---|---|
| **Phase 2** | Site vitrine + module de don | ✅ **fait** (prise en avance sur la Phase 1 : c'est la vitrine qui débloque la collecte) |
| **Phase 1** | Back-office : Supabase + RLS, membres/bénéficiaires, programmes & activités, finances, dons, documents, communication, tableau de bord | 🔴 à faire |
| **Phase 3** | App mobile Expo : consultation, dons, reçus, notifications | 🔴 à faire |
| **Phase 4** | Rapports de transparence automatisés, module bénévolat, statistiques avancées, paiement en ligne (CinetPay/PayDunya) | 🔴 à faire |

### Branchement du site sur la Phase 1 (à faire dans cet ordre)
1. Créer `packages/supabase` + migrations (`profiles`, `donations`, `news`, `activities`, `documents`).
2. Écrire `SupabaseSubmissionStore` et remplacer `fileSubmissionStore` dans `lib/actions.ts` — **une ligne**.
3. Remplacer les imports de `content/*.ts` par des requêtes serveur (les types sont déjà les bons).
4. Brancher les chiffres clés de l'accueil sur une fonction `report_stats()` SECURITY DEFINER.
5. Passer `IS_DEMO_CONTENT` à `false` → le bandeau d'avertissement disparaît.

---

## 7. Pièges déjà rencontrés sur ce poste (ne pas les redécouvrir)

- ⚠️ **`service_role` ne contourne PAS les GRANTs SQL**, seulement la RLS. Les Edge Functions échouaient sur « permission denied for table profiles » parce que la migration initiale n'accordait les privilèges qu'à `anon` et `authenticated`. Corrigé par `20260808110000_service_role_grants.sql`, qui pose aussi des `alter default privileges` pour les tables à venir.
- ⚠️ **Nouvelle Edge Function en local → relancer TOUTE la stack** (`supabase stop && supabase start`). La liste des fonctions est calculée au démarrage ; redémarrer le seul conteneur `edge_runtime` donne `404 Function not found`.
- ⚠️ **`CI=true` est requis** pour tout `pnpm install` non interactif (sinon `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`), mais `CI=true` implique `--frozen-lockfile` : lors de l'ajout d'un nouveau workspace, il faut `CI=true pnpm install --no-frozen-lockfile`.
- ⚠️ **Le projet vit dans `C:\dev\qardan-hassana`, PAS dans OneDrive** (déplacé le 2026-08-07, comme mosquee-fitia et ouatt-telecom). OneDrive corrompt `.next` et sature les handles de watch.
- ⚠️⚠️ **NE JAMAIS faire `rm -rf node_modules` depuis git-bash sur ce monorepo.** Les liens d'espace de travail (`apps/*/node_modules/@qardan/*`) sont des **jonctions Windows**, et `rm -rf` les SUIT : la commande a vidé le contenu réel de `packages/design-tokens`, `packages/shared` et `packages/supabase` (dossiers conservés, sources effacées), sans passer par la corbeille. Perte sèche, récupérée uniquement parce que le contenu était encore en contexte. ➜ Utiliser `pnpm install --force`, ou supprimer par PowerShell (`Remove-Item -Recurse` ne suit pas les points de jonction), ou supprimer d'abord les jonctions.
- ⚠️ Après un déplacement du projet, les jonctions pointent encore sur l'ancien chemin : `pnpm install` seul ne les recrée pas (il voit le dossier et passe). Il faut supprimer les `node_modules` — **par PowerShell**, cf. ci-dessus — puis réinstaller. `CI=true` est nécessaire, sinon pnpm demande confirmation et abandonne (`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`).
- ⚠️ **`pnpm install` prend ~19 minutes** ici. Le lancer en tâche de fond, ne pas conclure au blocage.
- ⚠️ **Piège Next** : `EINVAL: invalid argument, readlink '.next/app-build-manifest.json'` = dossier `.next` corrompu (OneDrive / arrêt brutal). Arrêter le serveur → supprimer `apps/site/.next` → relancer. **Ne jamais supprimer `.next` pendant que `next dev` tourne.**
- ⚠️ **Doublons React** : garder les `overrides` pnpm `react`/`react-dom`/`@types/react` à la racine. Sans eux, « Incompatible React versions » ou un typage `ReactNode` cassé (leçon asso-jeunes).
- ⚠️ **Patcher des fichiers TSX par script** : normaliser CRLF→LF d'abord, et passer par un `.mjs` écrit avec l'outil Write plutôt qu'un heredoc shell (les échappements sautent).
- ⚠️ `useSearchParams` dans un composant client **exige une frontière `<Suspense>`**, sinon le pré-rendu statique échoue (cf. `/don`).
- ⚠️ **Ne JAMAIS lancer `next build` pendant que `next dev` tourne** : les deux écrivent dans `.next` → le serveur de dev part en 500. Arrêter le dev, builder, supprimer `.next`, relancer.
- ⚠️ **Un module `"use server"` ne peut exporter QUE des fonctions async.** `FormState` et `INITIAL_FORM_STATE` vivent donc dans `lib/form-state.ts`. Le typecheck ne l'attrape pas — seul `next build` le refuse.
- ⚠️ **Toute animation qui masque du contenu doit avoir un filet de sécurité.** Constaté à la vérification : dans le navigateur d'automatisation, **ni `IntersectionObserver`, ni `requestAnimationFrame`, ni les transitions CSS ne s'exécutent** (la page ne compose pas de frames). Résultat initial : 34 blocs bloqués à `opacity: 0` et des chiffres clés affichant « 0 ». Correctifs appliqués — `lib/reveal.ts` détecte par `getBoundingClientRect()` sur `scroll` et, au bout de 3 s, **retire la classe `reveal-init` de `<html>`** (supprimer la règle de masquage est la seule garantie qui ne dépende d'aucune animation) ; `CountUp` pose la valeur finale au bout de 3 s. **Ne pas réintroduire d'IntersectionObserver ici.**
- ⚠️ **Après tout changement de structure de `app/`** (ex. passage sous `[locale]`), supprimer `.next` avant de retypechecker : les types générés dans `.next/types` pointent encore sur l'ancienne arborescence et produisent des dizaines de faux « Cannot find module ».
- ⚠️ **`not-found.tsx` ne reçoit pas `params`** — impossible d'y connaître la locale côté serveur. La page 404 déduit donc la langue de `usePathname()`, ce qui en fait un composant client. Ce n'est pas un oubli.
- ⚠️ Les **captures d'écran sont impossibles** dans cette session (« Browser pane is not displayed ») : vérifier par lecture du DOM et des styles calculés (`javascript_tool`), pas visuellement.
- ⚠️ `scroll-behavior: smooth` est actif : en automatisation, `window.scrollTo(...)` semble ne rien faire. Utiliser `behavior: 'instant'` après avoir forcé `style.scrollBehavior = 'auto'`.

---

## 8. Comment lancer

```bash
# depuis qardan-hassana/
pnpm install
pnpm site          # http://localhost:3040
pnpm typecheck
```

---

## 9. Questions ouvertes (§9 du cahier des charges)

- Volume réel de bénéficiaires/membres actuellement suivis (papier ? Excel ?)
- Opérateur de paiement prioritaire confirmé (Orange Money) + agrégateur retenu (CinetPay / PayDunya)
- Disponibilité des contenus : photos, logo HD/SVG, rapports financiers existants
- ~~Langues~~ → **tranché le 2026-08-07 : français par défaut + arabe.** Reste à valider par un relecteur arabophone (voir §3 bis).
- Niveau de détail de la transparence financière publique : rapports complets ou résumés ?
