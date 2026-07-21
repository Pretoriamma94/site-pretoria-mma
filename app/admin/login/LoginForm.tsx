'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createBrowserAuthClient } from '@/lib/supabase/auth-browser';

type Props = {
  initialError?: string | null;
};

export function LoginForm({ initialError }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createBrowserAuthClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError('Email ou mot de passe incorrect.');
        return;
      }

      const user = data.user;
      if (user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }

      // Navigation pleine page pour appliquer les cookies session au middleware.
      window.location.assign('/admin');
    } catch {
      setError('Connexion impossible. Réessayez dans quelques instants.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-mma-red focus-visible:ring-2 focus-visible:ring-mma-red/60"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-mma-red focus-visible:ring-2 focus-visible:ring-mma-red/60"
        />
      </div>

      <p className="text-right text-xs">
        <Link href="/admin/login/forgot-password" className="text-red-400 hover:underline">
          Mot de passe oublié ou première connexion ?
        </Link>
      </p>

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
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
