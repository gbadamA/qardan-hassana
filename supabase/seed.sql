-- ═══════════════════════════════════════════════════════════════════════════
-- Jeu de données de DÉVELOPPEMENT.
--
-- ⚠️ Ne jamais exécuter sur la base de production : il crée des comptes dont les
-- mots de passe sont écrits en clair ci-dessous. Il n'est appliqué que par
-- `supabase db reset`, qui repart d'une base vide en local.
--
-- Comptes créés (mot de passe identique : qardan1234) :
--   pca@qardan.ci          — Super Admin (PCA)
--   tresorier@qardan.ci    — Trésorier Général
--   commissaire@qardan.ci  — Commissaire aux Comptes (LECTURE SEULE)
--   direction@qardan.ci    — Direction Exécutive
--   social@qardan.ci       — Responsable du programme Social (ne voit que le sien)
-- ═══════════════════════════════════════════════════════════════════════════

-- Création des comptes d'authentification.
-- Un profil ne peut pas exister sans `auth.users` : c'est pourquoi, hors seed, la
-- création de comptes passera par une Edge Function en service_role.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  u.id,
  'authenticated',
  'authenticated',
  u.email,
  crypt('qardan1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name),
  '', '', '', ''
from (values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'pca@qardan.ci',         'Imam Traoré Yaya'),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'tresorier@qardan.ci',   'Traoré Sholly'),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'commissaire@qardan.ci', 'Koné Ibrahim'),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'direction@qardan.ci',   'Sanogo Mamadou'),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'social@qardan.ci',      'Diallo Aminata')
) as u(id, email, full_name);

-- Identités : sans elles, GoTrue refuse la connexion par mot de passe.
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u;

insert into public.profiles (id, full_name, role, program, email, phone) values
  ('11111111-1111-4111-8111-111111111111', 'Imam Traoré Yaya', 'super_admin',   null,     'pca@qardan.ci',         '+2250747008383'),
  ('22222222-2222-4222-8222-222222222222', 'Traoré Sholly',    'tresorier',     null,     'tresorier@qardan.ci',   '+2250707941571'),
  ('33333333-3333-4333-8333-333333333333', 'Koné Ibrahim',     'commissaire',   null,     'commissaire@qardan.ci', null),
  ('44444444-4444-4444-8444-444444444444', 'Sanogo Mamadou',   'direction',     null,     'direction@qardan.ci',   '+2250707302229'),
  ('55555555-5555-4555-8555-555555555555', 'Diallo Aminata',   'resp_programme','social', 'social@qardan.ci',      null);

-- ── Bénéficiaires ────────────────────────────────────────────────────────────
insert into public.beneficiaries (full_name, program, category, status, birth_year, phone, notes) values
  ('Kouassi Adjoua',   'social',       'enfant_popb',          'actif', 2021, null, 'Bras gauche — rééducation en cours, séances hebdomadaires.'),
  ('Yao Kouadio',      'social',       'jeune_desoeuvre',      'actif', 2004, '+2250701020304', 'Orienté en mécanique auto, atelier du quartier.'),
  ('Famille Traoré',   'social',       'famille_endeuillee',   'actif', null, null, 'Père décédé en janvier, trois enfants scolarisés.'),
  ('Bamba Salif',      'sante-sport',  'malade',               'actif', 1968, '+2250705060708', 'Hypertension dépistée au tournoi, traitement pris en charge 1 mois.'),
  ('Coulibaly Fatou',  'education',    'apprenant',            'actif', 2010, null, 'Mémorisation — niveau consigné chaque trimestre.'),
  ('Ouattara Moussa',  'education',    'apprenant',            'suivi_termine', 2006, null, null);

insert into public.assistance_records (beneficiary_id, occurred_on, kind, amount_fcfa, description)
select id, current_date - 20, 'Séance de kinésithérapie', 12000, 'Cycle de 4 séances, première réalisée.'
from public.beneficiaries where full_name = 'Kouassi Adjoua';

insert into public.assistance_records (beneficiary_id, occurred_on, kind, amount_fcfa, description)
select id, current_date - 45, 'Panier alimentaire', 25000, 'Aide d''urgence des premières semaines.'
from public.beneficiaries where full_name = 'Famille Traoré';

-- ── Activités ────────────────────────────────────────────────────────────────
insert into public.activities (title_fr, title_ar, program, status, starts_at, place, budget_fcfa, is_public, registration_required, description_fr) values
  ('Journée de salubrité trimestrielle', 'يوم النظافة الفصلي', 'environnement', 'planifie',
   now() + interval '15 days', 'Cimetière municipal', 150000, true, true,
   'Débroussaillage des allées et évacuation des déchets verts.'),
  ('Consultation foraine : tension et glycémie', 'عيادة متنقلة', 'sante-sport', 'planifie',
   now() + interval '29 days', 'Place du marché', 200000, true, false,
   'Dépistage gratuit ouvert à tous.'),
  ('Remise des kits scolaires', 'توزيع الحقائب المدرسية', 'education', 'en_cours',
   now() - interval '3 days', 'Siège de l''ONG', 300000, true, false, null);

-- ── Dons ─────────────────────────────────────────────────────────────────────
-- Deux validés (pour que les chiffres du tableau de bord ne soient pas à zéro)
-- et deux en attente (pour que le Trésorier ait de quoi s'exercer).
insert into public.donations (amount_fcfa, program, method, status, donor_name, donor_phone, anonymous, transaction_ref, validated_by, validated_at, created_at) values
  (25000, 'education',     'orange-money', 'valide', 'Sylla Mariam',  '+2250707112233', false, 'OM-8842119', '22222222-2222-4222-8222-222222222222', now() - interval '6 days', now() - interval '7 days'),
  (50000, null,            'especes',      'valide', 'Anonyme',       '+2250700000000', true,  null,        '22222222-2222-4222-8222-222222222222', now() - interval '2 days', now() - interval '2 days'),
  (10000, 'social',        'wave',         'en_attente', 'Bakayoko Ali','+2250709887766', false, null, null, null, now() - interval '1 day'),
  (5000,  'environnement', 'mtn-momo',     'en_attente', 'Doumbia Sekou','+2250755443322', false, null, null, null, now());

-- ── Dépenses ─────────────────────────────────────────────────────────────────
insert into public.expenses (label, amount_fcfa, program, spent_on, method, recorded_by) values
  ('Location de benne — journée de salubrité', 45000, 'environnement', current_date - 30, 'especes',      '22222222-2222-4222-8222-222222222222'),
  ('Kits scolaires (60 unités)',              180000, 'education',     current_date - 12, 'virement',     '22222222-2222-4222-8222-222222222222'),
  ('Consommables de dépistage',                35000, 'sante-sport',   current_date - 5,  'orange-money', '22222222-2222-4222-8222-222222222222'),
  ('Frais de déplacement du bureau',           15000, null,            current_date - 3,  'especes',      '22222222-2222-4222-8222-222222222222');

-- ── Actualité publiée (visible immédiatement sur le site public) ─────────────
insert into public.news (slug, program, title_fr, title_ar, excerpt_fr, excerpt_ar, body_fr, author, reading_minutes, status, published_at) values
  ('journee-de-salubrite-au-cimetiere', 'environnement',
   'Journée de salubrité : 180 bénévoles au cimetière municipal',
   'يوم النظافة: 180 متطوعًا في المقبرة البلدية',
   'Une matinée, des machettes, des sacs et beaucoup de sueur.',
   'صباح واحد، ومناجل، وأكياس، وعرق كثير.',
   'Il était six heures et demie quand les premiers bénévoles se sont présentés à l''entrée du cimetière.
## Ce qui a été fait
Débroussaillage des allées, évacuation de douze bennes de déchets verts.',
   'Cellule Communication', 3, 'publie', now() - interval '10 days');
