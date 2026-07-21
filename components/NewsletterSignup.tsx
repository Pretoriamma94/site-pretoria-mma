'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function NewsletterSignup() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('success');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor="newsletter-email" className="sr-only">
        Votre email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="Votre email"
        autoComplete="email"
        className="min-h-11 h-11 flex-1 rounded-full border border-zinc-700 bg-black/60 px-4 text-base text-white outline-none transition focus-visible:border-mma-red focus-visible:ring-2 focus-visible:ring-mma-red/60 md:text-sm"
      />
      <Button type="submit" size="md">
        S&apos;abonner
      </Button>
      {status === 'success' && (
        <p className="text-sm text-success" role="status" aria-live="polite">
          Inscription enregistrée (simulation).
        </p>
      )}
    </form>
  );
}
