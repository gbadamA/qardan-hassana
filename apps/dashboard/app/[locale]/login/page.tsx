"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogIn, ShieldAlert } from "lucide-react";
import {
  DEFAULT_LOCALE,
  ORG,
  getDictionary,
  isLocale,
  localePath,
  type Locale,
} from "@qardan/shared";
import { getSupabase, isSupabaseConfigured } from "@qardan/supabase";
import { getDashUi } from "@/content";
import { profileCanEnter, useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Connexion du personnel : email + mot de passe.
 * Les donateurs, eux, se connectent par OTP SMS depuis l'app mobile — le back-office
 * n'a pas besoin d'un canal SMS pour une dizaine de comptes.
 */
export default function LoginPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const ui = getDashUi(locale);
  const dict = getDictionary(locale);

  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  // Déjà connecté : on entre, sauf si le rôle n'y a pas droit (un donateur, par exemple).
  useEffect(() => {
    if (loading || !session) return;
    if (profileCanEnter(profile)) router.replace(localePath(locale, "/"));
    else if (profile) setError(profile.is_active ? ui.login.forbidden : ui.login.inactive);
  }, [loading, session, profile, router, locale, ui]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (authError) setError(ui.login.failed);
    // La redirection est faite par l'effet ci-dessus, une fois le PROFIL chargé :
    // rediriger dès l'authentification ferait entrer un donateur une fraction de
    // seconde avant de le rejeter.
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle labels={ui.common} />
        </div>

        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald text-white shadow-glow">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="font-display text-h1 text-light-text dark:text-dark-text">
            {ui.login.title}
          </h1>
          <p className="mt-1 text-caption text-light-muted dark:text-dark-muted">
            {ORG.name} — {ui.app.name}
          </p>
          <p className="arabic mt-3 text-xl text-leaf">{ORG.nameArabic}</p>
        </div>

        {!configured && (
          <div className="mb-6 rounded-md border border-warning/40 bg-warning/10 p-4 text-caption text-warning">
            {ui.login.notConfigured}
          </div>
        )}

        <form onSubmit={submit} className="card p-6">
          <label htmlFor="email" className="field-label">
            {ui.login.email}
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            className="field-input mb-4"
          />

          <label htmlFor="password" className="field-label">
            {ui.login.password}
          </label>
          <input
            id="password"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="field-input mb-5"
          />

          <button type="submit" disabled={busy || !configured} className="btn-primary w-full">
            <LogIn className="h-4 w-4 rtl:-scale-x-100" />
            {busy ? ui.login.submitting : ui.login.submit}
          </button>

          {error && (
            <p role="alert" className="mt-4 text-center text-caption font-medium text-danger">
              {error}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-caption leading-relaxed text-light-muted dark:text-dark-muted">
          {dict.org.legalShort}
        </p>
      </div>
    </main>
  );
}
