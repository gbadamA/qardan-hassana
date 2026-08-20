-- ═══════════════════════════════════════════════════════════════════════════
-- Espace donateur : rattacher un don à son auteur, et lui permettre de
-- réclamer les dons faits avant qu'il n'ait un compte.
--
-- Le socle existait déjà : la colonne `donations.donor_id` et la policy
-- `donations_staff_read` — `USING (is_staff() OR donor_id = auth.uid())`.
-- Ce qui manquait, c'était de RENSEIGNER cette colonne.
--
-- ⚠️ Un donateur n'a PAS de ligne dans `profiles`, et c'est voulu : `profiles`
-- décrit le personnel de l'ONG et ses rôles. `auth_role()` renvoie donc NULL
-- pour lui, `is_staff()` est faux, et seule la condition `donor_id = auth.uid()`
-- lui ouvre ses propres dons. Rien d'autre.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Le don retient son auteur quand il y en a un ────────────────────────
--
-- ⚠️ `auth.uid()` fonctionne bien dans une fonction `security definer` : le
-- `definer` change le RÔLE utilisé pour les permissions, pas les claims du JWT,
-- qui restent ceux de l'appelant. Un visiteur non connecté obtient NULL, donc
-- un don anonyme — exactement le comportement actuel, préservé.
create or replace function submit_public_donation(
  p_amount int,
  p_program program_slug,
  p_method payment_method,
  p_frequency text,
  p_donor_name text,
  p_donor_phone text,
  p_donor_email text default null,
  p_anonymous boolean default false,
  p_message text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_reference text;
begin
  if p_amount is null or p_amount < 500 then
    raise exception 'Montant invalide' using errcode = '22023';
  end if;
  if coalesce(trim(p_donor_name), '') = '' or coalesce(trim(p_donor_phone), '') = '' then
    raise exception 'Coordonnées incomplètes' using errcode = '22023';
  end if;

  insert into donations (
    amount_fcfa, program, method, status, frequency,
    donor_name, donor_phone, donor_email, anonymous, message, donor_id
  ) values (
    p_amount, p_program, p_method, 'en_attente',
    case when p_frequency = 'mensuel' then 'mensuel' else 'ponctuel' end,
    trim(p_donor_name), trim(p_donor_phone), nullif(trim(coalesce(p_donor_email, '')), ''),
    coalesce(p_anonymous, false), nullif(trim(coalesce(p_message, '')), ''),
    auth.uid()
  )
  returning reference into new_reference;

  return new_reference;
end;
$$;

grant execute on function submit_public_donation(int, program_slug, payment_method, text, text, text, text, boolean, text) to anon, authenticated;

-- ── 2. Réclamer un don antérieur à la création du compte ───────────────────
--
-- Sans ça, l'historique d'un donateur commencerait le jour de son inscription,
-- et ses versements précédents resteraient orphelins — le cas le plus courant,
-- puisqu'on ne demande PAS de compte pour donner (exiger une inscription avant
-- de donner ferait perdre des dons).
--
-- ⚠️ La référence seule ne suffit PAS à autoriser : `DON-2026-0001` est
-- séquentielle, donc devinable. Il faut la référence ET le numéro de téléphone
-- saisi lors du don. Deux éléments dont seul le donateur dispose.
--
-- ⚠️ Un don déjà rattaché n'est jamais volé à son propriétaire : la condition
-- `donor_id is null` l'interdit.
create or replace function claim_donation(p_reference text, p_phone text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  touched text;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise' using errcode = '42501';
  end if;

  update donations
     set donor_id = auth.uid()
   where upper(trim(p_reference)) = upper(reference)
     -- Comparaison sur les dix DERNIERS chiffres : « 07 47 00 83 83 »,
     -- « +2250747008383 » et « 0747008383 » désignent le même numéro, et le donateur
     -- n'a pas à deviner le format qu'il avait utilisé.
     --
     -- ⚠️ Égalité stricte, surtout pas un `like '%' || chiffres` : un suffixe suffirait
     -- alors à réclamer le don d'un autre, puisque la référence, elle, est séquentielle
     -- donc devinable. On exige aussi un numéro complet, pas deux chiffres.
     and right(regexp_replace(donor_phone, '\D', '', 'g'), 10)
       = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10)
     and length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 8
     and donor_id is null
  returning reference into touched;

  if touched is null then
    raise exception 'Aucun don ne correspond à cette référence et à ce numéro'
      using errcode = '22023';
  end if;

  return touched;
end;
$$;

grant execute on function claim_donation(text, text) to authenticated;
