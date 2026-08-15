-- ═══════════════════════════════════════════════════════════════════════════
-- Soumissions publiques via des FONCTIONS, plus par un INSERT direct.
--
-- ⚠️ PROBLÈME RÉSOLU : le site insérait le don puis relisait la ligne pour afficher la
-- référence au donateur (`.insert(...).select("reference")`). Or un visiteur anonyme n'a
-- — à juste titre — AUCUN droit de lecture sur `donations` : il verrait sinon les
-- coordonnées et les montants de tous les autres donateurs. PostgREST rejetait donc
-- l'opération entière avec « new row violates row-level security policy », un message
-- trompeur puisque l'écriture, elle, était autorisée.
--
-- La bonne réponse n'est pas d'ouvrir la lecture, mais de ne rien rendre lisible :
-- une fonction `security definer` insère et ne renvoie QUE la référence. Le visiteur
-- obtient son numéro de suivi, et rien d'autre.
--
-- Bénéfice secondaire : le statut et les champs de validation sont fixés DANS la
-- fonction. Un client malveillant ne peut plus tenter d'auto-valider son don — il n'a
-- même plus de paramètre pour l'exprimer.
-- ═══════════════════════════════════════════════════════════════════════════

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
  -- Garde-fous rejoués côté base : la validation Zod du site protège l'ergonomie,
  -- pas la base. Quelqu'un peut appeler cette fonction sans passer par le formulaire.
  if p_amount is null or p_amount < 500 then
    raise exception 'Montant invalide' using errcode = '22023';
  end if;
  if coalesce(trim(p_donor_name), '') = '' or coalesce(trim(p_donor_phone), '') = '' then
    raise exception 'Coordonnées incomplètes' using errcode = '22023';
  end if;

  insert into donations (
    amount_fcfa, program, method, status, frequency,
    donor_name, donor_phone, donor_email, anonymous, message
  ) values (
    p_amount, p_program, p_method, 'en_attente',
    case when p_frequency = 'mensuel' then 'mensuel' else 'ponctuel' end,
    trim(p_donor_name), trim(p_donor_phone), nullif(trim(coalesce(p_donor_email, '')), ''),
    coalesce(p_anonymous, false), nullif(trim(coalesce(p_message, '')), '')
  )
  returning reference into new_reference;

  return new_reference;
end;
$$;

create or replace function submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_phone text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_reference text;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_message), '') = '' then
    raise exception 'Message incomplet' using errcode = '22023';
  end if;

  insert into contact_messages (name, email, phone, subject, message)
  values (trim(p_name), trim(p_email), nullif(trim(coalesce(p_phone, '')), ''),
          p_subject, trim(p_message))
  returning reference into new_reference;

  return new_reference;
end;
$$;

create or replace function submit_volunteer_application(
  p_full_name text,
  p_phone text,
  p_city text,
  p_motivation text,
  p_programs program_slug[],
  p_availability text[],
  p_birth_year int default null,
  p_email text default null,
  p_skills text default null,
  p_wants_membership boolean default false
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_reference text;
begin
  if coalesce(array_length(p_programs, 1), 0) = 0 then
    raise exception 'Au moins un programme est requis' using errcode = '22023';
  end if;

  insert into volunteer_applications (
    full_name, phone, email, city, birth_year, programs, availability,
    skills, motivation, wants_membership
  ) values (
    trim(p_full_name), trim(p_phone), nullif(trim(coalesce(p_email, '')), ''), trim(p_city),
    p_birth_year, p_programs, coalesce(p_availability, '{}'),
    nullif(trim(coalesce(p_skills, '')), ''), trim(p_motivation), coalesce(p_wants_membership, false)
  )
  returning reference into new_reference;

  return new_reference;
end;
$$;

grant execute on function submit_public_donation(int, program_slug, payment_method, text, text, text, text, boolean, text) to anon, authenticated;
grant execute on function submit_contact_message(text, text, text, text, text) to anon, authenticated;
grant execute on function submit_volunteer_application(text, text, text, text, program_slug[], text[], int, text, text, boolean) to anon, authenticated;

-- Les policies d'INSERT direct deviennent inutiles : le seul chemin d'écriture publique
-- passe désormais par les fonctions ci-dessus. Les retirer réduit la surface d'attaque.
drop policy if exists donations_public_insert on donations;
drop policy if exists contact_public_insert on contact_messages;
drop policy if exists volunteer_public_insert on volunteer_applications;

revoke insert on donations from anon;
revoke insert on contact_messages, volunteer_applications from anon;
