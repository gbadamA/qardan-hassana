-- ═══════════════════════════════════════════════════════════════════════════
-- ONG Qardan Hassana — schéma initial du back-office (Phase 1)
--
-- Couvre les modules §4.1 à §4.5 du cahier des charges :
--   4.1 Authentification & utilisateurs   → profiles + rôles + activity_log
--   4.2 Membres & bénéficiaires           → beneficiaries + assistance_records
--   4.3 Programmes & activités            → activities
--   4.4 Finances & comptabilité           → expenses (+ vues d'agrégats)
--   4.5 Dons & collecte                   → donations + campaigns
--   4.7 Communication                     → news + events (publiés vers le site)
--
-- ⚠️ PRINCIPE DE SÉCURITÉ : tout passe par la RLS. Aucune requête du dashboard ne
-- suppose « l'utilisateur est gentil ». Le Commissaire aux Comptes, en particulier,
-- ne doit avoir AUCUNE policy d'écriture — c'est ce qui donne sa valeur à son avis.
--
-- ⚠️ BILINGUE : les tables stockent des identifiants (`program`, `role`, `status`),
-- jamais des libellés traduits. Les textes éditoriaux destinés au site public ont
-- deux colonnes (`title_fr` / `title_ar`) plutôt qu'une table de traduction : deux
-- langues fixées par décision produit, une jointure de moins à chaque lecture.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Types ────────────────────────────────────────────────────────────────────

create type app_role as enum (
  'super_admin',      -- PCA
  'tresorier',
  'commissaire',      -- LECTURE SEULE, sans exception
  'direction',
  'administratif',
  'resp_programme',
  'donateur'          -- app mobile / espace donateur
);

create type program_slug as enum ('social', 'environnement', 'education', 'sante-sport');

create type payment_method as enum (
  'orange-money', 'mtn-momo', 'moov-money', 'wave', 'especes', 'virement'
);

create type donation_status as enum ('en_attente', 'valide', 'rejete');

create type beneficiary_status as enum ('actif', 'suivi_termine', 'suspendu');

create type activity_status as enum ('planifie', 'en_cours', 'termine', 'annule');

create type publication_status as enum ('brouillon', 'publie', 'archive');

-- ── Profils ──────────────────────────────────────────────────────────────────
-- Un profil ne peut pas exister sans `auth.users` : la création de comptes passe
-- donc par une Edge Function en service_role (leçon mosquee-fitia).

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role app_role not null default 'donateur',
  -- Un responsable de programme ne voit QUE son programme. `null` = tous.
  program program_slug,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on column profiles.program is
  'Programme de rattachement — obligatoire pour resp_programme, ignoré pour les autres rôles.';

-- ── Fonctions d''autorisation ────────────────────────────────────────────────
-- `security definer` + `search_path` vide : sans ça, une policy qui lit `profiles`
-- se rappellerait elle-même en boucle (récursion RLS).

create or replace function auth_role()
returns app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function auth_program()
returns program_slug
language sql
stable
security definer
set search_path = ''
as $$
  select program from public.profiles where id = auth.uid()
$$;

/** Membre du back-office, quel que soit son niveau (donc hors donateurs). */
create or replace function is_staff()
returns boolean
language sql
stable
as $$
  select auth_role() in (
    'super_admin', 'tresorier', 'commissaire', 'direction', 'administratif', 'resp_programme'
  )
$$;

/** Peut écrire sur les données opérationnelles (bénéficiaires, activités). */
create or replace function can_write_ops()
returns boolean
language sql
stable
as $$
  select auth_role() in ('super_admin', 'direction', 'administratif', 'resp_programme')
$$;

/** Peut écrire sur l''argent. Le commissaire en est exclu par construction. */
create or replace function can_write_finance()
returns boolean
language sql
stable
as $$
  select auth_role() in ('super_admin', 'tresorier')
$$;

/** Vrai si l''utilisateur a le droit d''agir sur ce programme précis. */
create or replace function covers_program(target program_slug)
returns boolean
language sql
stable
as $$
  select case
    when auth_role() = 'resp_programme' then auth_program() is not distinct from target
    else is_staff()
  end
$$;

-- ── Bénéficiaires (§4.2) ─────────────────────────────────────────────────────

create table beneficiaries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  program program_slug not null,
  -- Sous-catégorie propre au programme : 'jeune_desoeuvre', 'enfant_popb',
  -- 'famille_endeuillee', 'malade', 'apprenant', 'participant_sportif'…
  category text not null,
  status beneficiary_status not null default 'actif',
  birth_year int,
  phone text,
  address text,
  -- Données de suivi propres à la catégorie (niveau de mémorisation, séances de
  -- kiné réalisées, atelier d'apprentissage…). En jsonb : ces champs diffèrent
  -- d'un programme à l'autre et évolueront sans migration.
  details jsonb not null default '{}'::jsonb,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index beneficiaries_program_idx on beneficiaries (program, status);

-- Historique d'assistance (§4.2 « Historique d'assistance par bénéficiaire »)
create table assistance_records (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references beneficiaries(id) on delete cascade,
  occurred_on date not null default current_date,
  kind text not null,          -- 'kinesitherapie', 'panier_alimentaire', 'scolarite'…
  amount_fcfa int,             -- null si l'aide n'est pas monétaire
  description text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index assistance_beneficiary_idx on assistance_records (beneficiary_id, occurred_on desc);

-- ── Campagnes & dons (§4.5) ──────────────────────────────────────────────────

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text,
  program program_slug,        -- null = campagne générale
  goal_fcfa int not null check (goal_fcfa > 0),
  starts_on date not null default current_date,
  ends_on date,
  status publication_status not null default 'brouillon',
  created_at timestamptz not null default now()
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  -- Référence lisible communiquée au donateur : DON-2026-0001
  reference text not null unique,
  amount_fcfa int not null check (amount_fcfa >= 500),
  program program_slug,        -- null = don général, affecté par le CA
  campaign_id uuid references campaigns(id) on delete set null,
  method payment_method not null,
  status donation_status not null default 'en_attente',
  frequency text not null default 'ponctuel',
  donor_name text not null,
  donor_phone text not null,
  donor_email text,
  -- Le donateur peut demander que son nom n'apparaisse dans aucune publication.
  anonymous boolean not null default false,
  message text,
  -- N° de transaction Mobile Money : c'est LA preuve que le trésorier rapproche.
  transaction_ref text,
  -- Renseigné à la validation, jamais avant.
  validated_by uuid references profiles(id),
  validated_at timestamptz,
  rejection_reason text,
  -- Compte du donateur s'il est connecté (app mobile) ; null pour un don du site.
  donor_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index donations_status_idx on donations (status, created_at desc);
create index donations_program_idx on donations (program);

comment on table donations is
  'Le don est une PREUVE, pas un encaissement : le site enregistre en en_attente, le Trésorier valide.';

-- ── Dépenses (§4.4) ──────────────────────────────────────────────────────────

create table expenses (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  amount_fcfa int not null check (amount_fcfa > 0),
  program program_slug,        -- null = frais de fonctionnement
  activity_id uuid,            -- FK ajoutée après la création d'`activities`
  spent_on date not null default current_date,
  method payment_method not null default 'especes',
  -- Chemin du justificatif dans le bucket privé `justificatifs`.
  proof_path text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index expenses_program_idx on expenses (program, spent_on desc);

-- ── Activités (§4.3) ─────────────────────────────────────────────────────────

create table activities (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text,
  description_fr text,
  description_ar text,
  program program_slug not null,
  status activity_status not null default 'planifie',
  starts_at timestamptz not null,
  ends_at timestamptz,
  place text,
  city text default 'Abidjan',
  budget_fcfa int,             -- budget alloué ; le dépensé se calcule sur `expenses`
  -- Publication à l'agenda public du site.
  is_public boolean not null default false,
  registration_required boolean not null default false,
  report text,                 -- compte rendu après coup
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index activities_program_idx on activities (program, starts_at desc);

alter table expenses
  add constraint expenses_activity_fk
  foreign key (activity_id) references activities(id) on delete set null;

-- ── Actualités (§4.7, publiées vers le site) ─────────────────────────────────

create table news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  program program_slug not null,
  title_fr text not null,
  title_ar text,
  excerpt_fr text not null,
  excerpt_ar text,
  body_fr text not null,
  body_ar text,
  author text not null,
  reading_minutes int not null default 3,
  status publication_status not null default 'brouillon',
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

comment on column news.title_ar is
  'Null tant que la version arabe n''est pas écrite : le site retombe alors sur le français.';

-- ── Journal d''activité (§4.1) ───────────────────────────────────────────────

create table activity_log (
  id bigserial primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,        -- 'donation.validate', 'beneficiary.create'…
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_created_idx on activity_log (created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table beneficiaries enable row level security;
alter table assistance_records enable row level security;
alter table campaigns enable row level security;
alter table donations enable row level security;
alter table expenses enable row level security;
alter table activities enable row level security;
alter table news enable row level security;
alter table activity_log enable row level security;

-- Profils : chacun lit le sien ; le staff lit tout ; seuls PCA et Service
-- Administratif modifient les comptes.
create policy profiles_self_read on profiles for select
  using (id = auth.uid() or is_staff());

create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_admin_write on profiles for all
  using (auth_role() in ('super_admin', 'administratif'))
  with check (auth_role() in ('super_admin', 'administratif'));

-- Bénéficiaires : le staff lit ; un responsable de programme n'écrit que sur le sien.
-- ⚠️ Aucune policy pour le rôle `donateur` : les dossiers sociaux ne sortent pas du
-- back-office. Un enfant suivi pour POPB n'a rien à faire dans une app publique.
create policy beneficiaries_staff_read on beneficiaries for select
  using (is_staff() and covers_program(program));

create policy beneficiaries_write on beneficiaries for all
  using (can_write_ops() and covers_program(program))
  with check (can_write_ops() and covers_program(program));

create policy assistance_staff_read on assistance_records for select
  using (is_staff());

create policy assistance_write on assistance_records for all
  using (can_write_ops()) with check (can_write_ops());

-- Campagnes : lecture publique des campagnes publiées (le site les affiche).
create policy campaigns_public_read on campaigns for select
  using (status = 'publie' or is_staff());

create policy campaigns_write on campaigns for all
  using (can_write_finance()) with check (can_write_finance());

-- Dons : le staff lit tout ; le donateur ne lit QUE les siens.
create policy donations_staff_read on donations for select
  using (is_staff() or donor_id = auth.uid());

-- Un visiteur non authentifié doit pouvoir déposer une intention de don depuis le
-- site — mais UNIQUEMENT en `en_attente`, jamais pré-validée.
create policy donations_public_insert on donations for insert
  to anon
  with check (status = 'en_attente' and validated_by is null and validated_at is null);

-- ⚠️ Policy indispensable à la SAISIE AU GUICHET : l'essentiel des dons d'une ONG de
-- quartier arrive en espèces au siège, et c'est le Trésorier qui les saisit — déjà
-- validés, puisqu'il a l'argent en main. Sans cette policy, la seule règle d'insertion
-- serait celle des visiteurs (`status = 'en_attente'`), et le formulaire du back-office
-- échouerait en silence sur un « new row violates row-level security policy ».
create policy donations_finance_insert on donations for insert
  to authenticated
  with check (can_write_finance() or status = 'en_attente');

create policy donations_finance_write on donations for update
  using (can_write_finance()) with check (can_write_finance());

create policy donations_finance_delete on donations for delete
  using (auth_role() = 'super_admin');

-- Dépenses : lecture staff (le commissaire en a besoin), écriture finance seule.
create policy expenses_staff_read on expenses for select using (is_staff());

create policy expenses_write on expenses for all
  using (can_write_finance()) with check (can_write_finance());

-- Activités : lecture publique si publiques ; écriture par programme.
create policy activities_public_read on activities for select
  using (is_public or is_staff());

create policy activities_write on activities for all
  using (can_write_ops() and covers_program(program))
  with check (can_write_ops() and covers_program(program));

-- Actualités : lecture publique si publiées.
create policy news_public_read on news for select
  using (status = 'publie' or is_staff());

create policy news_write on news for all
  using (can_write_ops()) with check (can_write_ops());

-- Journal : lisible par le PCA et le commissaire (piste d'audit), écrit par tous
-- les membres du staff via leurs actions.
create policy log_read on activity_log for select
  using (auth_role() in ('super_admin', 'commissaire'));

create policy log_insert on activity_log for insert
  with check (is_staff());

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANTs — sans eux, la RLS ne suffit pas : PostgREST répond « permission denied »
-- avant même d'évaluer les policies (leçon asso-jeunes).
-- ═══════════════════════════════════════════════════════════════════════════

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on donations to anon;              -- don depuis le site public
grant usage, select on all sequences in schema public to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Agrégats — `security definer` car la RLS empêche un rôle restreint de sommer
-- des lignes qu'il ne peut pas lire une par une.
-- ═══════════════════════════════════════════════════════════════════════════

/** Chiffres du tableau de bord (§4.8) et de la page Transparence du site. */
create or replace function dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'donations_validated_fcfa', coalesce((select sum(amount_fcfa) from donations where status = 'valide'), 0),
    'donations_pending_count',  (select count(*) from donations where status = 'en_attente'),
    'donations_pending_fcfa',   coalesce((select sum(amount_fcfa) from donations where status = 'en_attente'), 0),
    'donations_month_fcfa',     coalesce((select sum(amount_fcfa) from donations
                                          where status = 'valide'
                                            and created_at >= date_trunc('month', now())), 0),
    'expenses_fcfa',            coalesce((select sum(amount_fcfa) from expenses), 0),
    'balance_fcfa',             coalesce((select sum(amount_fcfa) from donations where status = 'valide'), 0)
                                - coalesce((select sum(amount_fcfa) from expenses), 0),
    'beneficiaries_total',      (select count(*) from beneficiaries),
    'beneficiaries_active',     (select count(*) from beneficiaries where status = 'actif'),
    'activities_ongoing',       (select count(*) from activities where status = 'en_cours'),
    'by_program',               coalesce((
      select jsonb_object_agg(p.program, p.data) from (
        select b.program,
               jsonb_build_object(
                 'beneficiaries', count(b.id),
                 'donations_fcfa', coalesce((select sum(d.amount_fcfa) from donations d
                                             where d.program = b.program and d.status = 'valide'), 0),
                 'expenses_fcfa',  coalesce((select sum(e.amount_fcfa) from expenses e
                                             where e.program = b.program), 0)
               ) as data
        from beneficiaries b group by b.program
      ) p
    ), '{}'::jsonb)
  )
$$;

/** Progression d'une campagne — un donateur ne peut pas sommer les dons des autres. */
create or replace function campaign_progress(campaign uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'collected_fcfa', coalesce(sum(amount_fcfa) filter (where status = 'valide'), 0),
    'donors_count',   count(distinct donor_phone) filter (where status = 'valide')
  )
  from donations where campaign_id = campaign
$$;

grant execute on function dashboard_stats() to authenticated;
grant execute on function campaign_progress(uuid) to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Numérotation des dons — côté BASE, pas côté application.
-- Deux dons simultanés depuis le site généreraient sinon la même référence.
-- ═══════════════════════════════════════════════════════════════════════════

create sequence donation_reference_seq;

create or replace function next_donation_reference()
returns text
language sql
volatile
as $$
  select 'DON-' || extract(year from now())::text || '-' ||
         lpad(nextval('donation_reference_seq')::text, 4, '0')
$$;

grant execute on function next_donation_reference() to anon, authenticated;

create or replace function set_donation_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := next_donation_reference();
  end if;
  return new;
end;
$$;

create trigger donations_set_reference
  before insert on donations
  for each row execute function set_donation_reference();

-- ═══════════════════════════════════════════════════════════════════════════
-- Realtime — le dashboard voit arriver les dons du site sans rafraîchir.
-- ═══════════════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table donations;
alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table news;
