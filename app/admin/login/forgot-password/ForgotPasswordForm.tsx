'use client';

import { useState } from 'react';
import { createBrowserAuthClient } from '@/lib/supabase/auth-browser';
import { getSiteUrl } from '@/lib/site-url';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createBrowserAuthClient();
      const siteUrl = getSiteUrl();
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent('/admin/login/reset-password')}`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo },
      );

      if (resetError) {
        setError('Envoi impossible. Vérifiez l’adresse e-mail ou réessayez plus tard.');
        return;
      }

      setMessage(
        'Si un compte administrateur existe avec cette adresse, un e-mail vient d’être envoyé. Consultez votre boîte de réception (et les spams).',
      );
    } catch {
      setError('Envoi impossible. Réessayez dans quelques instants.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Email administrateur
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

      {error ? (
        <p className="rounded-lg border border-red-800/80 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-emerald-800/80 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Envoi…' : 'Envoyer le lien'}
      </button>
    </form>
  );
}
