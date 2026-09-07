'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import {
  dismissNewsPopup,
  recordNewsPopupImpression,
  shouldShowNewsPopup,
} from '@/lib/news-popup-visitor';
import { isNewsPopupExcludedPath, type NewsPopupPayload } from '@/lib/news-popup';
import { Button } from '@/components/ui/button';

export function NewsPopup({ post }: { post: NewsPopupPayload }) {
  const pathname = usePathname();
  const titleId = useId();
  const [open, setOpen] = useState(false);

  const excluded =
    isNewsPopupExcludedPath(pathname) || pathname === `/actualites/${post.slug}`;

  useEffect(() => {
    // Lecture localStorage côté client uniquement (évite un mismatch d'hydratation SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const visible = !excluded && shouldShowNewsPopup(post.id, post.max_affichages);
    setOpen(visible);
    if (visible) recordNewsPopupImpression(post.id);
  }, [excluded, post.id, post.max_affichages]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        dismissNewsPopup(post.id);
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, post.id]);

  if (!open || excluded) return null;

  function close() {
    dismissNewsPopup(post.id);
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fermer le pop-up"
        className="absolute inset-0 bg-black/75"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-zinc-600 bg-zinc-950/90 text-white shadow-lg transition hover:border-white hover:bg-zinc-900"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>

        {post.image_url ? (
          <div className="shrink-0 overflow-hidden border-b border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt=""
              className="max-h-52 w-full object-cover sm:max-h-64"
            />
          </div>
        ) : null}

        <div className="min-h-0 overflow-y-auto px-5 pb-6 pt-5 sm:px-6">
          <p className="pr-12 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Actualité
          </p>
          <h2
            id={titleId}
            className="mt-2 font-display text-2xl uppercase tracking-wide text-white sm:text-3xl"
          >
            {post.titre}
          </h2>
          {post.resume ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {post.resume}
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/actualites/${post.slug}`} onClick={close}>
                Lire l&apos;article
              </Link>
            </Button>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
