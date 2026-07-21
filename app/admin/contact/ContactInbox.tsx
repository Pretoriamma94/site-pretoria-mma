'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { markContactMessageAction, deleteContactMessageAction } from '../actions';
import type { ContactMessage } from '@/types/database';

type Props = {
  initialMessages: ContactMessage[];
  filter: 'open' | 'done' | 'all';
};

export function ContactInbox({ initialMessages, filter }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setFilter = (next: 'open' | 'done' | 'all') => {
    const params = next === 'open' ? '' : `?filtre=${next}`;
    router.push(`/admin/contact${params}`);
  };

  const toggle = async (id: string, traite: boolean) => {
    setLoadingId(id);
    setError(null);
    const result = await markContactMessageAction(id, traite);
    setLoadingId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              traite: result.traite,
              date_traitement: result.traite ? new Date().toISOString() : null,
            }
          : m,
      ),
    );
    router.refresh();
  };

  const remove = async (id: string, sujet: string) => {
    const ok = window.confirm(
      `Supprimer définitivement le message « ${sujet} » ?\n\nCette action est irréversible.`,
    );
    if (!ok) return;
    setLoadingId(id);
    setError(null);
    const result = await deleteContactMessageAction(id);
    setLoadingId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    router.refresh();
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['open', 'Non traités'],
            ['done', 'Traités'],
            ['all', 'Tous'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide',
              filter === value
                ? 'bg-mma-red text-white'
                : 'border border-zinc-600 text-zinc-300 hover:border-zinc-400',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-xs text-red-400">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {messages.map((msg) => (
          <article
            key={msg.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{msg.sujet}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {msg.nom} · {msg.email}
                  {msg.created_at
                    ? ` · ${new Date(msg.created_at).toLocaleString('fr-FR')}`
                    : ''}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
                  msg.traite
                    ? 'bg-emerald-900/40 text-emerald-200'
                    : 'bg-amber-900/40 text-amber-200',
                )}
              >
                {msg.traite ? 'Traité' : 'À traiter'}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{msg.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loadingId === msg.id}
                onClick={() => toggle(msg.id, !msg.traite)}
                className="rounded-full border border-zinc-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
              >
                {msg.traite ? 'Remettre en non traité' : 'Marquer comme traité'}
              </button>
              <button
                type="button"
                disabled={loadingId === msg.id}
                onClick={() => remove(msg.id, msg.sujet)}
                className="rounded-full border border-red-800/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-300 hover:border-red-500 hover:bg-red-950/40 disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
        {messages.length === 0 && (
          <p className="rounded-2xl border border-zinc-800 px-4 py-8 text-center text-sm text-zinc-400">
            Aucun message dans cette vue.
          </p>
        )}
      </div>
    </>
  );
}
