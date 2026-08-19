# Projet : Plateforme Qardan Hassana (Gestion ONG + App Mobile + Site Web)

## 1. Contexte

L'ONG **Qardan Hassana** est une organisation non gouvernementale ivoirienne, créée conformément à la loi n° 60-315 du 21 septembre 1960 relative aux Associations en Côte d'Ivoire. Elle est **apolitique** et **à but non lucratif**.

**Slogan** : *"Pour la bonne cause"*

### Objet de l'ONG
- La promotion du bien-être social
- La protection de l'environnement
- La promotion de l'éducation comme valeur cardinale de la société

### Les 4 programmes d'activité

| Programme | Actions |
|---|---|
| **SOCIAL** | Réinsertion et assistance des jeunes désœuvrés ; prise en charge des enfants atteints de la maladie de POPB (Paralysie Obstétricale du Plexus Brachial) ; assistance aux familles endeuillées |
| **ENVIRONNEMENT** | Entretien des cimetières ; sensibilisation sur l'hygiène et l'environnement |
| **ÉDUCATION & FORMATION** | Formation et éducation sur la culture islamique ; mémorisation du Saint Qur'an |
| **SANTÉ & SPORT** | Prise en charge des malades (cas sociaux) ; compétitions sportives pour la santé par le sport |

### Organigramme

```
Conseil d'Administration
├── Trésorier Général
├── Commissaire aux Comptes
└── Direction Exécutive
    └── Service Administratif
        ├── Programme SOCIAL
        ├── Programme SANTÉ-SPORT
        ├── Programme ENVIRONNEMENT
        └── Programme ÉDUCATION-FORMATION
```

### Contacts de l'ONG

| Rôle | Nom | Téléphone |
|---|---|---|
| PCA (Président du Conseil d'Administration) | *(voir `.env.local`)* | *(voir `.env.local`)* |
| Secrétaire Exécutif | *(voir `.env.local`)* | *(voir `.env.local`)* |
| Trésorier | *(voir `.env.local`)* | *(voir `.env.local`)* |

> ⚠️ Les noms et numéros des responsables ont été retirés de ce document versionné : le
> dépôt est public. Ils vivent dans les variables d'environnement (`.env.example` liste
> les clés attendues).


---

## 2. Objectif du projet

Concevoir et développer une plateforme numérique complète pour digitaliser la gestion de l'ONG, améliorer sa transparence financière, faciliter la collecte de dons, suivre les bénéficiaires de ses 4 programmes, et donner une vitrine publique à ses actions.

La plateforme comprend **3 briques** :
1. **Back-office web (dashboard d'administration)** — gestion interne
2. **Application mobile** — donateurs, membres, grand public
3. **Site web vitrine** — communication publique, dons en ligne

---

## 3. Utilisateurs et rôles (RBAC)

| Rôle | Accès |
|---|---|
| **Super Admin (PCA)** | Accès total, validation des grandes décisions, vue consolidée des 4 programmes |
| **Trésorier Général** | Module finances, comptabilité, rapports de trésorerie, validation des dépenses |
| **Commissaire aux Comptes** | Accès lecture seule aux finances, export des rapports d'audit |
| **Direction Exécutive** | Gestion opérationnelle, coordination des programmes, validation des activités |
| **Service Administratif** | Gestion des membres, courrier, documents administratifs |
| **Responsable de Programme** (x4 : Social, Santé-Sport, Environnement, Éducation-Formation) | Gestion des bénéficiaires et activités de son programme uniquement |
| **Donateur / Membre (app mobile)** | Consultation des programmes, dons en ligne, suivi de ses propres dons, actualités |
| **Grand public (site web)** | Consultation vitrine, formulaire de don, contact |

---

## 4. Back-office Web (Dashboard d'administration)

### 4.1 Module Authentification & Gestion des utilisateurs
- Connexion sécurisée par rôle (RBAC ci-dessus)
- Gestion des comptes du Conseil d'Administration, staff, responsables de programme
- Journal d'activité (logs) par utilisateur

### 4.2 Module Membres & Bénéficiaires
- Fiche membre de l'ONG (adhérents, bénévoles)
- Fiche bénéficiaire par programme :
  - **Social** : jeunes désœuvrés (suivi réinsertion), enfants POPB (dossier médical/social), familles endeuillées (aide accordée)
  - **Santé-Sport** : malades pris en charge (cas sociaux), participants aux compétitions sportives
  - **Éducation-Formation** : élèves/apprenants en culture islamique, mémorisation du Coran (suivi de progression, niveau de mémorisation)
  - **Environnement** : cimetières suivis, campagnes de sensibilisation et participants
- Historique d'assistance par bénéficiaire
- Recherche et filtres (par programme, statut, date)

### 4.3 Module Programmes & Activités
- Création/planification d'activités par programme (ex : compétition sportive, session de sensibilisation, cérémonie POPB)
- Suivi d'avancement (planifié / en cours / terminé)
- Budget alloué vs dépensé par activité
- Comptes-rendus et photos d'activités (à publier ensuite sur le site/app)

### 4.4 Module Finances & Comptabilité
- Enregistrement des dons reçus (espèces, Orange Money, Mobile Money, virement)
- Suivi des dépenses par programme
- Rapports de trésorerie (mensuel, annuel)
- Génération de reçus de don (PDF)
- Tableau de bord financier pour le Trésorier Général
- Vue lecture seule / export pour le Commissaire aux Comptes (transparence, audit)

### 4.5 Module Dons & Collecte de fonds
- Suivi des campagnes de collecte (par programme ou générale)
- Historique des donateurs (récurrents, ponctuels)
- Intégration paiement mobile (**Orange Money** en priorité, puis MTN Money / Moov Money)
- Génération automatique de reçu/attestation de don

### 4.6 Module Documents administratifs
- Statuts, PV de réunions du Conseil d'Administration
- Rapports d'activité annuels
- Archivage des documents officiels (récépissé loi 1960, etc.)

### 4.7 Module Communication
- Gestion des actualités/annonces (publiées sur site + app)
- Gestion des événements publics (dates, lieux)
- Notifications push vers l'app mobile

### 4.8 Tableau de bord (Dashboard principal)
- Vue consolidée : nombre de bénéficiaires par programme, dons du mois, activités en cours
- Graphiques (dons collectés/dépensés par programme, évolution mensuelle)
- Alertes (budget dépassé, activité en retard)

---

## 5. Application Mobile (Donateurs / Membres / Grand public)

### Fonctionnalités
- **Écran d'accueil** : présentation de l'ONG, les 4 programmes, actualités récentes
- **Faire un don** : choix du programme (ou don général), montant libre, paiement via Orange Money / Mobile Money, reçu instantané
- **Mes dons** (espace personnel) : historique des dons effectués, reçus téléchargeables
- **Programmes** : détail de chaque programme (Social, Environnement, Éducation-Formation, Santé-Sport) avec photos/actualités
- **Événements** : calendrier des activités publiques (compétitions sportives, sensibilisations), inscription possible
- **Devenir bénévole/membre** : formulaire d'adhésion
- **Actualités** : fil d'actualités des actions de l'ONG
- **Contact** : coordonnées du PCA, Secrétaire Exécutif, Trésorier ; localisation
- **Notifications push** : nouvelles campagnes, événements, remerciements après don
- **Multilingue** : Français (par défaut), possibilité d'ajouter l'arabe (contexte culturel islamique)

---

## 6. Site Web Vitrine

### Pages
- **Accueil** : présentation, mission, chiffres clés (bénéficiaires aidés, dons collectés), appel au don
- **À propos** : historique, cadre légal (loi n°60-315 du 21/09/1960), organigramme, valeurs
- **Nos programmes** : 4 pages détaillées (Social, Environnement, Éducation-Formation, Santé-Sport)
- **Actualités / Blog** : articles sur les activités menées
- **Faire un don** : formulaire de don en ligne (paiement Orange Money / carte bancaire)
- **Événements** : agenda public
- **Devenir bénévole** : formulaire d'engagement
- **Transparence** : rapports financiers annuels téléchargeables (PDF)
- **Contact** : formulaire de contact + coordonnées (PCA, Secrétaire Exécutif, Trésorier) + carte
- **Téléchargement app mobile** : liens App Store / Play Store

### Exigences
- Design responsive, identité visuelle basée sur le logo (vert/blanc/noir, cercle, silhouettes d'entraide)
- Optimisé SEO (visibilité locale Côte d'Ivoire / Abidjan)
- Formulaire de don sécurisé et simple (mobile-first, majorité des visiteurs sur téléphone)

---

## 7. Stack technique proposée

| Composant | Techno suggérée |
|---|---|
| Back-office web | Next.js (React) + Tailwind CSS |
| API backend | Node.js (NestJS ou Express) + PostgreSQL |
| App mobile | React Native (Expo) — iOS + Android à partir d'une seule base de code |
| Site vitrine | Next.js (SSR/SSG pour le SEO) |
| Authentification | JWT + gestion des rôles (RBAC) |
| Paiement | Intégration API Orange Money CI (+ CinetPay ou PayDunya comme agrégateur multi-opérateurs) |
| Stockage fichiers/photos | S3-compatible (ou Cloudinary) |
| Notifications push | Firebase Cloud Messaging |
| Hébergement | VPS ou cloud (à définir selon budget) |

---

## 8. Priorités de développement (phasage suggéré)

1. **Phase 1 — MVP Back-office** : gestion membres/bénéficiaires, gestion des 4 programmes, module finances de base
2. **Phase 2 — Site vitrine** : pages statiques + module don en ligne (Orange Money)
3. **Phase 3 — App mobile** : consultation, dons, notifications
4. **Phase 4 — Fonctionnalités avancées** : rapports de transparence automatisés, module bénévolat, statistiques avancées

---

## 9. Points à clarifier avec le client (Qardan Hassana)

- Volume estimé de bénéficiaires/membres actuellement suivis (papier/Excel ?)
- Budget et opérateur de paiement mobile prioritaire (Orange Money confirmé, autres opérateurs à ajouter ?)
- Disponibilité de contenus (photos, logo HD, rapports financiers existants) pour peupler le site
- Langues à supporter (français uniquement, ou français + arabe ?)
- Niveau de détail souhaité pour la transparence financière publique (rapports complets vs résumés)
