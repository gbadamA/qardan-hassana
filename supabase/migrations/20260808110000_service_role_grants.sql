-- ═══════════════════════════════════════════════════════════════════════════
-- GRANTs manquants pour `service_role`.
--
-- ⚠️ DÉFAUT CORRIGÉ : la migration initiale accordait les privilèges de table à
-- `anon` et `authenticated` uniquement. `service_role` — le rôle qu'utilisent les Edge
-- Functions — n'avait donc AUCUN droit sur les tables créées par ces migrations.
--
-- Symptôme observé : `create-member` créait bien l'utilisateur dans `auth.users`, puis
-- échouait sur l'insertion du profil avec « permission denied for table profiles », et
-- annulait proprement la création. Trompeur, car `service_role` est réputé « tout
-- pouvoir » : il contourne la RLS, mais **pas les GRANTs SQL**, qui sont une couche
-- antérieure. Contourner la RLS ne sert à rien si l'on n'a pas le droit d'ouvrir la table.
-- ═══════════════════════════════════════════════════════════════════════════

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Et pour les tables que les prochaines migrations créeront, afin de ne pas
-- redécouvrir le problème à chaque ajout.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
