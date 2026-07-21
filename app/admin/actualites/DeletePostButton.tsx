'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePostAction } from '../actions';

type Props = {
  postId: string;
  titre: string;
};

export function DeletePostButton({ postId, titre }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          `Supprimer définitivement « ${titre} » ?\n\nCette action est irréversible.`,
        );
        if (!ok) return;
        startTransition(async () => {
          const formData = new FormData();
          formData.set('post_id', postId);
          await deletePostAction(formData);
          router.refresh();
        });
      }}
      className="rounded-full border border-red-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-300 transition hover:border-red-500 hover:bg-red-950/40 disabled:opacity-60"
    >
      {pending ? '…' : 'Supprimer'}
    </button>
  );
}
