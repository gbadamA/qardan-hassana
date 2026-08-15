-- ═══════════════════════════════════════════════════════════════════════════
-- Correction de `dashboard_stats()` — répartition par programme.
--
-- ⚠️ BUG CORRIGÉ : la version initiale construisait `by_program` en partant de
-- `beneficiaries` (`group by b.program`). Un programme SANS bénéficiaire n'apparaissait
-- donc pas du tout — et ses dons et ses dépenses disparaissaient du tableau de bord avec
-- lui. Constaté sur le jeu de données de développement : le programme Environnement
-- affichait « 0 FCFA » de dépenses alors qu'il en avait 45 000.
--
-- La bonne source d'itération est l'ÉNUMÉRATION des programmes, pas une table de faits :
-- les quatre programmes existent statutairement, qu'ils aient ou non de l'activité.
-- ═══════════════════════════════════════════════════════════════════════════

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
    'by_program',               (
      select jsonb_object_agg(p.slug, jsonb_build_object(
        'beneficiaries',  (select count(*) from beneficiaries b where b.program = p.slug),
        'donations_fcfa', coalesce((select sum(d.amount_fcfa) from donations d
                                    where d.program = p.slug and d.status = 'valide'), 0),
        'expenses_fcfa',  coalesce((select sum(e.amount_fcfa) from expenses e
                                    where e.program = p.slug), 0)
      ))
      from unnest(enum_range(null::program_slug)) as p(slug)
    )
  )
$$;

grant execute on function dashboard_stats() to authenticated;
