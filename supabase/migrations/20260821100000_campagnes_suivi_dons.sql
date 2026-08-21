-- ═══════════════════════════════════════════════════════════════════════════
-- Module « Suivi des dons » — campagnes de collecte avec objectif public.
--
-- ⚠️ Le socle existait déjà : la table `campaigns`, la colonne `donations.campaign_id`
-- et la fonction `campaign_progress()`, qui ne compte QUE les dons validés. La règle
-- métier clé de la spec — « un don n'impacte jamais la barre avant validation par le
-- Trésorier » — était donc déjà tenue. On étend, on ne refait pas.
--
-- Ce que cette migration ajoute :
--   1. de quoi présenter une campagne (description, visuel) ;
--   2. le choix du donateur d'afficher ou non son montant ;
--   3. deux fonctions de lecture PUBLIQUE, seul chemin par lequel un visiteur
--      anonyme voit quoi que ce soit de la table `donations` ;
--   4. la correction d'un droit : créer une campagne relève de l'Administratif et de
--      la Direction, pas du Trésorier.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Présentation d'une campagne ─────────────────────────────────────────
alter table campaigns add column if not exists description_fr text;
alter table campaigns add column if not exists description_ar text;
alter table campaigns add column if not exists image_url text;

comment on column campaigns.image_url is
  'URL du visuel. Volontairement une URL et non un fichier en Storage : l''ONG n''a pas '
  'encore de banque d''images, et un bucket vide compliquerait le back-office pour rien.';

-- ⚠️ Pas de colonne `montant_collecte` ni `nombre_donateurs` stockées, contrairement à
-- la lettre de la spec. Une somme figée se désynchronise à la première validation ou au
-- premier rejet, et plus personne ne sait laquelle des deux valeurs dit vrai.
-- `campaign_progress()` les calcule à la demande, à partir des dons validés.

-- ── 2. Le donateur choisit d'afficher son montant ──────────────────────────
--
-- ⚠️ La table `donations` avait déjà `anonymous` (masquer le NOM). Il manquait de quoi
-- masquer le MONTANT — c'est le « Privé » de la spec, deux réglages distincts.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'donation_visibility') then
    create type donation_visibility as enum ('public', 'prive');
  end if;
end $$;

alter table donations
  add column if not exists visibility donation_visibility not null default 'public';

comment on column donations.visibility is
  '« public » : le montant et le message s''affichent sur la page de campagne. '
  '« prive » : seul le nom apparaît (ou « Anonyme » si anonymous). Le défaut est '
  '« public » parce que le donateur fait ce choix EN VOYANT la liste sur laquelle il '
  'va figurer — le formulaire le lui dit explicitement avant l''envoi.';

-- ── 3. Qui crée une campagne ───────────────────────────────────────────────
--
-- ⚠️ Correction d'un droit : la policy existante confiait l'écriture à
-- `can_write_finance()`, c'est-à-dire au PCA et au Trésorier. Or le Trésorier VALIDE les
-- dons, il ne décide pas des collectes à lancer. La spec confie cela au Service
-- Administratif et à la Direction Exécutive.
create or replace function can_write_campaigns()
returns boolean
language sql
stable
as $$ select auth_role() in ('super_admin', 'direction', 'administratif') $$;

drop policy if exists campaigns_write on campaigns;

create policy campaigns_write on campaigns
  for all using (can_write_campaigns()) with check (can_write_campaigns());

-- ── 4. Lecture publique des campagnes, progression comprise ────────────────
--
-- Une seule requête pour toute la page : appeler `campaign_progress()` campagne par
-- campagne depuis le navigateur ferait autant d'allers-retours que de collectes.
create or replace function public_campaigns(p_program program_slug default null)
returns table (
  id             uuid,
  title_fr       text,
  title_ar       text,
  description_fr text,
  description_ar text,
  image_url      text,
  program        program_slug,
  goal_fcfa      int,
  collected_fcfa bigint,
  donors_count   bigint,
  starts_on      date,
  ends_on        date,
  closed         boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.title_fr, c.title_ar, c.description_fr, c.description_ar, c.image_url,
         c.program, c.goal_fcfa,
         coalesce(d.collected, 0)::bigint,
         coalesce(d.donors, 0)::bigint,
         c.starts_on, c.ends_on,
         -- « Clôturée » se DÉDUIT : archivée, ou date de fin dépassée. Un statut figé
         -- obligerait quelqu'un à passer derrière chaque campagne le jour de son terme.
         (c.status = 'archive' or (c.ends_on is not null and c.ends_on < current_date)) as closed
    from campaigns c
    left join lateral (
      select sum(amount_fcfa) filter (where status = 'valide')            as collected,
             count(distinct donor_phone) filter (where status = 'valide') as donors
        from donations where campaign_id = c.id
    ) d on true
   where c.status in ('publie', 'archive')
     and (p_program is null or c.program = p_program)
     and c.starts_on <= current_date
   order by (c.status = 'archive'), c.starts_on desc;
$$;

grant execute on function public_campaigns(program_slug) to anon, authenticated;

-- ── 5. Liste publique des donateurs d'une campagne ─────────────────────────
--
-- ⚠️ C'est le SEUL chemin par lequel un visiteur anonyme voit quelque chose de la table
-- `donations`. La RLS lui en interdit toute lecture directe, et c'est très bien ainsi :
-- cette table contient les téléphones et les emails de tous les donateurs.
--
-- Ce que la fonction ne renvoie JAMAIS : téléphone, email, identifiant de ligne, statut.
-- Ce qu'elle masque selon le choix du donateur : son nom (`anonymous`), son montant et
-- son message (`visibility`).
create or replace function campaign_donors(
  p_campaign uuid,
  p_sort     text default 'recent',
  p_limit    int  default 5
)
returns table (
  display_name text,
  amount_fcfa  int,
  message      text,
  created_at   timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    case when d.anonymous then null else nullif(trim(d.donor_name), '') end,
    case when d.visibility = 'public' then d.amount_fcfa else null end,
    case when d.visibility = 'public' then nullif(trim(coalesce(d.message, '')), '') else null end,
    d.created_at
  from donations d
  where d.campaign_id = p_campaign
    -- Seuls les dons VALIDÉS s'affichent. Montrer une intention non encaissée gonflerait
    -- la liste d'argent que l'ONG n'a pas reçu.
    and d.status = 'valide'
  order by
    case when p_sort = 'montant'  then d.amount_fcfa end desc nulls last,
    case when p_sort = 'message'  then (nullif(trim(coalesce(d.message, '')), '') is not null) end desc nulls last,
    d.created_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 100));
$$;

grant execute on function campaign_donors(uuid, text, int) to anon, authenticated;

-- ── 6. Le formulaire de don accepte une campagne ───────────────────────────
--
-- ⚠️ On SUPPRIME l'ancienne signature avant de recréer : deux fonctions de même nom
-- rendraient l'appel ambigu pour PostgREST. Les nouveaux paramètres ont une valeur par
-- défaut, donc le site et l'application mobile, qui ne les passent pas, continuent de
-- fonctionner sans modification.
drop function if exists submit_public_donation(int, program_slug, payment_method, text, text, text, text, boolean, text);

create function submit_public_donation(
  p_amount int,
  p_program program_slug,
  p_method payment_method,
  p_frequency text,
  p_donor_name text,
  p_donor_phone text,
  p_donor_email text default null,
  p_anonymous boolean default false,
  p_message text default null,
  p_campaign uuid default null,
  p_visibility donation_visibility default 'public'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_reference text;
  campagne_ok   boolean;
begin
  if p_amount is null or p_amount < 500 then
    raise exception 'Montant invalide' using errcode = '22023';
  end if;
  if coalesce(trim(p_donor_name), '') = '' or coalesce(trim(p_donor_phone), '') = '' then
    raise exception 'Coordonnées incomplètes' using errcode = '22023';
  end if;

  -- ⚠️ La campagne est vérifiée ICI, pas seulement dans le formulaire : un client peut
  -- appeler cette fonction directement et rattacher un don à un brouillon, faussant la
  -- barre de progression d'une collecte non encore annoncée.
  if p_campaign is not null then
    select true into campagne_ok
      from campaigns
     where id = p_campaign
       and status = 'publie'
       and starts_on <= current_date
       and (ends_on is null or ends_on >= current_date);

    if not coalesce(campagne_ok, false) then
      raise exception 'Campagne inconnue ou close' using errcode = '22023';
    end if;
  end if;

  insert into donations (
    amount_fcfa, program, method, status, frequency,
    donor_name, donor_phone, donor_email, anonymous, message, donor_id,
    campaign_id, visibility
  ) values (
    p_amount, p_program, p_method, 'en_attente',
    case when p_frequency = 'mensuel' then 'mensuel' else 'ponctuel' end,
    trim(p_donor_name), trim(p_donor_phone), nullif(trim(coalesce(p_donor_email, '')), ''),
    coalesce(p_anonymous, false), nullif(trim(coalesce(p_message, '')), ''),
    auth.uid(),
    p_campaign, coalesce(p_visibility, 'public')
  )
  returning reference into new_reference;

  return new_reference;
end;
$$;

grant execute on function submit_public_donation(
  int, program_slug, payment_method, text, text, text, text, boolean, text, uuid, donation_visibility
) to anon, authenticated;
