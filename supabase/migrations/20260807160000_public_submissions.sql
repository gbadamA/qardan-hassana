-- ═══════════════════════════════════════════════════════════════════════════
-- Soumissions du site public : messages de contact et candidatures de bénévoles.
--
-- Jusqu'ici le site écrivait dans `apps/site/.data/*.jsonl` — utile en développement,
-- inutilisable en production (aucun disque persistant sur Vercel/Netlify, et surtout
-- rien de visible depuis le back-office). Ces deux tables ferment la boucle.
--
-- ⚠️ Écriture ANONYME autorisée (c'est le principe d'un formulaire public), mais :
--   • uniquement en INSERT, jamais en lecture — sinon n'importe qui lirait les
--     coordonnées de tous ceux qui ont écrit à l'ONG ;
--   • uniquement à l'état initial `nouveau`, pour qu'on ne puisse pas déposer un
--     message déjà marqué « traité ».
-- ═══════════════════════════════════════════════════════════════════════════

create type submission_status as enum ('nouveau', 'en_cours', 'traite', 'archive');

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status submission_status not null default 'nouveau',
  handled_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  full_name text not null,
  phone text not null,
  email text,
  city text not null,
  birth_year int,
  programs program_slug[] not null default '{}',
  availability text[] not null default '{}',
  skills text,
  motivation text not null,
  wants_membership boolean not null default false,
  status submission_status not null default 'nouveau',
  handled_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;
alter table volunteer_applications enable row level security;

create policy contact_public_insert on contact_messages for insert
  to anon, authenticated
  with check (status = 'nouveau' and handled_by is null);

create policy contact_staff_read on contact_messages for select
  using (is_staff());

create policy contact_staff_update on contact_messages for update
  using (can_write_ops()) with check (can_write_ops());

create policy volunteer_public_insert on volunteer_applications for insert
  to anon, authenticated
  with check (status = 'nouveau' and handled_by is null);

create policy volunteer_staff_read on volunteer_applications for select
  using (is_staff());

create policy volunteer_staff_update on volunteer_applications for update
  using (can_write_ops()) with check (can_write_ops());

grant select on contact_messages, volunteer_applications to authenticated;
grant insert on contact_messages, volunteer_applications to anon, authenticated;
grant update on contact_messages, volunteer_applications to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Numérotation MSG-AAAA-NNNN / BEN-AAAA-NNNN — côté base, comme les dons :
-- deux soumissions simultanées ne doivent pas produire la même référence.
-- ═══════════════════════════════════════════════════════════════════════════

create sequence contact_reference_seq;
create sequence volunteer_reference_seq;

create or replace function set_submission_reference()
returns trigger
language plpgsql
as $$
declare
  prefix text;
  seq text;
begin
  if new.reference is not null and new.reference <> '' then
    return new;
  end if;

  if tg_table_name = 'contact_messages' then
    prefix := 'MSG';
    seq := 'contact_reference_seq';
  else
    prefix := 'BEN';
    seq := 'volunteer_reference_seq';
  end if;

  new.reference := prefix || '-' || extract(year from now())::text || '-' ||
                   lpad(nextval(seq)::text, 4, '0');
  return new;
end;
$$;

create trigger contact_set_reference
  before insert on contact_messages
  for each row execute function set_submission_reference();

create trigger volunteer_set_reference
  before insert on volunteer_applications
  for each row execute function set_submission_reference();

grant usage, select on sequence contact_reference_seq, volunteer_reference_seq to anon, authenticated;
