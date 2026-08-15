-- ═══════════════════════════════════════════════════════════════════════════
-- Restriction de la lecture des dossiers de bénéficiaires.
--
-- ⚠️ DÉFAUT CORRIGÉ : `is_staff()` incluait le Commissaire aux Comptes, qui pouvait donc
-- lire l'intégralité des fiches nominatives — dont le dossier médico-social d'un enfant
-- atteint de POPB. Vérifié en simulant son rôle : 6 fiches lues.
--
-- Son mandat porte sur les COMPTES, pas sur les personnes. La minimisation des données
-- n'est pas une politesse : ces fiches contiennent de la donnée de santé, la catégorie
-- la plus sensible qui soit. Le Commissaire garde évidemment tout accès aux dons, aux
-- dépenses et aux agrégats — c'est cela, auditer.
--
-- ⚠️ Même logique pour le rôle `tresorier` : il valide de l'argent, pas des dossiers
-- sociaux. Les montants d'aide restent visibles côté finances, sans le nom du malade.
-- ═══════════════════════════════════════════════════════════════════════════

/** Rôles autorisés à consulter les dossiers de bénéficiaires. */
create or replace function can_read_beneficiaries()
returns boolean
language sql
stable
as $$
  select auth_role() in ('super_admin', 'direction', 'administratif', 'resp_programme')
$$;

drop policy if exists beneficiaries_staff_read on beneficiaries;
create policy beneficiaries_read on beneficiaries for select
  using (can_read_beneficiaries() and covers_program(program));

drop policy if exists assistance_staff_read on assistance_records;
create policy assistance_read on assistance_records for select
  using (can_read_beneficiaries());
