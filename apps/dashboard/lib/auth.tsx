"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured, type Tables } from "@qardan/supabase";
import { canAccessDashboard, type ProgramSlug, type Role } from "@qardan/shared";

export type Profile = Tables<"profiles">;

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  /** `true` tant qu'on ne sait pas encore s'il y a une session — ≠ « pas connecté ». */
  loading: boolean;
  signOut: () => Promise<void>;
  /** Raccourcis de droits, dérivés du rôle. Une seule définition pour toute l'app. */
  can: {
    writeFinance: boolean;
    writeOps: boolean;
    /**
     * Créer et éditer une collecte. Volontairement PLUS ÉTROIT que `writeOps` : décider
     * des campagnes à lancer relève de l'Administratif et de la Direction, pas d'un
     * responsable de programme. Miroir exact de `can_write_campaigns()` en base — c'est
     * elle qui fait foi, ceci ne fait qu'éviter d'afficher un bouton qui échouerait.
     */
    writeCampaigns: boolean;
    admin: boolean;
    /** Le Commissaire aux Comptes : lecture seule, sans exception. */
    readOnly: boolean;
  };
  /** Programme du responsable, `null` s'il voit tout. */
  scopedProgram: ProgramSlug | null;
};

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  can: { writeFinance: false, writeOps: false, writeCampaigns: false, admin: false, readOnly: true },
  scopedProgram: null,
});

/**
 * Session + profil du membre connecté.
 *
 * ⚠️ Le profil (donc le rôle) est relu depuis la base à chaque montage : le rôle n'est
 * JAMAIS lu depuis le JWT ni depuis le localStorage. Un utilisateur peut fabriquer ce
 * qu'il stocke localement ; il ne peut pas fabriquer une ligne de `profiles`.
 *
 * ⚠️ Ces droits ne servent qu'à masquer des boutons. **La sécurité réelle est la RLS**
 * côté Postgres : même si quelqu'un forçait l'affichage d'un bouton, la requête
 * échouerait. Le back-office n'est pas un gardien, c'est une interface.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sans configuration, on ne tente rien : `getSupabase()` lèverait et la page de
    // connexion — seul endroit où l'on peut diagnostiquer — deviendrait inaffichable.
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    let cancelled = false;

    const loadProfile = async (userId: string | undefined) => {
      if (!userId) {
        if (!cancelled) setProfile(null);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (!cancelled) setProfile(data ?? null);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      if (!cancelled) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (cancelled) return;
      setSession(next);
      await loadProfile(next?.user.id);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) await getSupabase().auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(() => {
    const role = profile?.role as Role | undefined;
    return {
      session,
      profile,
      loading,
      signOut,
      can: {
        writeFinance: role === "super_admin" || role === "tresorier",
        writeOps:
          role === "super_admin" ||
          role === "direction" ||
          role === "administratif" ||
          role === "resp_programme",
        writeCampaigns:
          role === "super_admin" || role === "direction" || role === "administratif",
        admin: role === "super_admin" || role === "administratif",
        readOnly: role === "commissaire",
      },
      scopedProgram: role === "resp_programme" ? ((profile?.program as ProgramSlug) ?? null) : null,
    };
  }, [session, profile, loading, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Le compte peut-il ouvrir le back-office ? (les donateurs, non) */
export function profileCanEnter(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.is_active) return false;
  return canAccessDashboard(profile.role as Role);
}
