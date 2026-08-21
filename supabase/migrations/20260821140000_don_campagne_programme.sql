-- Un don rattaché à une collecte hérite du programme de cette collecte.
--
-- ⚠️ Rien n'empêchait jusqu'ici d'enregistrer un don sur la collecte « Kits scolaires »
-- (programme Social) en déclarant `p_program = 'environnement'` : le formulaire laisse
-- l'un et l'autre libres, et un appel direct à la fonction encore plus. Le don comptait
-- alors dans la barre de progression d'une collecte Social ET dans les dépenses du
-- programme Environnement. Les deux tableaux du back-office donnaient des totaux
-- différents pour le même argent, sans qu'aucun des deux ne soit faux.
--
-- La collecte fait foi : elle est publiée, datée et rattachée par le Service
-- Administratif, alors que le programme envoyé par le client n'est qu'un champ de
-- formulaire. On lit donc le programme de la campagne pendant le contrôle déjà en place,
-- et on écrit celui-là.

create or replace function submit_public_donation(
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
  new_reference   text;
  campagne_ok     boolean;
  campagne_progr  program_slug;
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
    select true, c.program into campagne_ok, campagne_progr
      from campaigns c
     where c.id = p_campaign
       and c.status = 'publie'
       and c.starts_on <= current_date
       and (c.ends_on is null or c.ends_on >= current_date);

    if not coalesce(campagne_ok, false) then
      raise exception 'Campagne inconnue ou close' using errcode = '22023';
    end if;

    -- Une collecte « générale » (sans programme) laisse le choix du donateur intact :
    -- il n'y a alors rien à contredire.
    if campagne_progr is not null then
      p_program := campagne_progr;
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
