'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserAuthClient } from '@/lib/supabase/auth-browser';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const supabase = createBrowserAuthClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) {
          setSessionReady(Boolean(user));
        }
      } catch {
        if (!cancelled) setSessionReady(false);
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserAuthClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError('Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }

      window.location.assign('/admin');
    } catch {
      setError('Mise à jour impossible. Réessayez.');
      setIsSubmitting(false);
    }
  }

  if (sessionReady === null) {
    return <p className="mt-8 text-sm text-zinc-400">Vérification du lien…</p>;
  }

  if (sessionReady === false) {
    return (
      <div className="mt-8 space-y-4">
        <p className="rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.
        </p>
        <Link
          href="/admin/login/forgot-password"
          className="inline-block text-sm text-red-400 hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
        >
          Nouveau mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-mma-red focus-visible:ring-2 focus-visible:ring-mma-red/60"
        />
        <p className="mt-1 text-xs text-zinc-500">Minimum 8 caractères.</p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-mma-red focus-visible:ring-2 focus-visible:ring-mma-red/60"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-800/80 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}
      </button>
    </form>
  );
}
