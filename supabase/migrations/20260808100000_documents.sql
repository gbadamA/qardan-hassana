-- ═══════════════════════════════════════════════════════════════════════════
-- Module Documents administratifs (§4.6 du cahier des charges).
--
-- Statuts, PV du Conseil d'Administration, rapports d'activité et financiers,
-- récépissé de la loi 1960, justificatifs comptables.
--
-- ⚠️ **Deux niveaux de confidentialité, et c'est tout l'enjeu du module.**
--   • Un PV de Conseil d'Administration ou un justificatif de dépense est INTERNE :
--     il ne doit jamais être atteignable par une URL devinée.
--   • Un rapport financier annuel est au contraire destiné à être PUBLIÉ : c'est la
--     promesse de la page Transparence du site.
--
-- D'où un bucket **privé** (`documents`) : même les fichiers marqués publics y restent,
-- et l'accès public passe par une URL signée à durée de vie limitée, jamais par un
-- bucket ouvert. Un bucket public est irrévocable une fois l'URL diffusée.
-- ═══════════════════════════════════════════════════════════════════════════

create type document_kind as enum (
  'statuts',              -- statuts constitutifs, récépissé loi 1960
  'pv_ca',                -- procès-verbal de Conseil d'Administration
  'rapport_activite',
  'rapport_financier',
  'justificatif',         -- pièce comptable rattachée à une dépense
  'autre'
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text,
  kind document_kind not null default 'autre',
  /** Exercice concerné — sert au classement chronologique de la page Transparence. */
  year int,
  description text,
  /** Chemin dans le bucket privé `documents`. Jamais une URL : elle expirerait. */
  storage_path text not null,
  file_name text not null,
  file_size int,
  mime_type text,
  /**
   * `true` = destiné à la page Transparence du site public.
   * Le fichier RESTE dans le bucket privé ; c'est le site qui demandera une URL signée.
   */
  is_public boolean not null default false,
  /** Rattachement facultatif à une dépense (justificatif comptable). */
  expense_id uuid references expenses(id) on delete set null,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index documents_kind_idx on documents (kind, year desc);
create index documents_public_idx on documents (is_public) where is_public;

alter table documents enable row level security;

-- Lecture : tout le staff voit la liste (le Commissaire aux Comptes en a besoin pour
-- son audit) ; le public ne voit que les documents explicitement publiés.
create policy documents_read on documents for select
  using (is_public or is_staff());

-- Écriture : Direction, Service Administratif et PCA. Le Trésorier peut déposer ses
-- justificatifs comptables, mais rien d'autre — d'où le test sur `kind`.
create policy documents_write on documents for insert
  to authenticated
  with check (
    auth_role() in ('super_admin', 'direction', 'administratif')
    or (auth_role() = 'tresorier' and kind = 'justificatif')
  );

create policy documents_update on documents for update
  using (auth_role() in ('super_admin', 'direction', 'administratif'))
  with check (auth_role() in ('super_admin', 'direction', 'administratif'));

create policy documents_delete on documents for delete
  using (auth_role() in ('super_admin', 'administratif'));

grant select on documents to anon, authenticated;
grant insert, update, delete on documents to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Bucket de stockage — PRIVÉ.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  20971520, -- 20 Mo : un rapport annuel scanné dépasse vite 10 Mo
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Politiques du bucket. `storage.objects` a sa propre RLS, indépendante de la table
-- `documents` : autoriser l'une sans l'autre laisse soit une liste sans fichiers,
-- soit des fichiers sans traçabilité.
create policy documents_storage_read on storage.objects for select
  to authenticated
  using (bucket_id = 'documents' and is_staff());

create policy documents_storage_insert on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and auth_role() in ('super_admin', 'direction', 'administratif', 'tresorier')
  );

create policy documents_storage_delete on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents' and auth_role() in ('super_admin', 'administratif'));

-- ═══════════════════════════════════════════════════════════════════════════
-- Lecture publique des documents publiés — pour la page Transparence du site.
--
-- `security definer` : le visiteur anonyme n'a aucun droit sur `storage.objects`.
-- La fonction ne renvoie que les métadonnées ; c'est le SITE qui demandera ensuite
-- une URL signée par une Edge Function, afin qu'aucun chemin de stockage ne soit
-- exposé tel quel.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public_documents()
returns table (
  id uuid,
  title_fr text,
  title_ar text,
  kind document_kind,
  year int,
  description text,
  file_name text,
  file_size int,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select d.id, d.title_fr, d.title_ar, d.kind, d.year, d.description,
         d.file_name, d.file_size, d.created_at
  from documents d
  where d.is_public
  order by d.year desc nulls last, d.created_at desc
$$;

grant execute on function public_documents() to anon, authenticated;
