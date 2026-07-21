'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { submitContactAction, type ContactActionState } from '@/app/contact/actions';

const initialState: ContactActionState = {};

const fieldClassName =
  'w-full min-h-11 rounded-lg border border-zinc-700 bg-black/40 px-3 py-2.5 text-base text-white outline-none transition focus-visible:border-mma-red focus-visible:ring-2 focus-visible:ring-mma-red/60 md:text-sm';

const labelClassName =
  'mb-1.5 block text-sm font-semibold uppercase tracking-wide text-zinc-300';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState);

  return (
    <div className="space-y-6">
      <aside
        className="rounded-xl border border-mma-red/50 bg-mma-red/10 px-4 py-4 md:px-5 md:py-5"
        aria-label="Réserver un cours d'essai"
      >
        <p className="text-sm font-semibold text-white md:text-base">
          1er cours d&apos;essai gratuit
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-200 md:text-base">
          Pour le réserver rapidement, appelez directement{' '}
          <a
            href="tel:+33619845786"
            className="font-bold text-white underline decoration-red-400 underline-offset-2 transition hover:text-red-300"
          >
            06 19 84 57 86
          </a>{' '}
          — Romain
        </p>
      </aside>

      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contact-nom" className={labelClassName}>
              Nom complet
            </label>
            <input
              id="contact-nom"
              required
              className={fieldClassName}
              name="nom"
              autoComplete="name"
              minLength={2}
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClassName}>
              Email
            </label>
            <input
              id="contact-email"
              required
              type="email"
              name="email"
              autoComplete="email"
              className={fieldClassName}
              maxLength={160}
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-sujet" className={labelClassName}>
            Sujet
          </label>
          <input
            id="contact-sujet"
            required
            name="sujet"
            minLength={3}
            maxLength={160}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="contact-message" className={labelClassName}>
            Message
          </label>
          <textarea
            id="contact-message"
            required
            name="message"
            rows={5}
            minLength={10}
            maxLength={4000}
            className={`${fieldClassName} min-h-[8rem]`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Envoi…' : 'Envoyer le message'}
          </Button>
          {state.error ? (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-success" role="status" aria-live="polite">
              {state.success}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
