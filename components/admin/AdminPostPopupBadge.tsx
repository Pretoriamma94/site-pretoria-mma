import { popupAdminStatus, type PopupAdminStatus } from '@/lib/news-popup';

const LABELS: Record<
  Exclude<PopupAdminStatus, 'off'>,
  { text: string; className: string }
> = {
  live: { text: 'Actif', className: 'bg-red-500/15 text-red-400' },
  scheduled: { text: 'Programmé', className: 'bg-amber-500/15 text-amber-400' },
  expired: { text: 'Expiré', className: 'bg-zinc-700/40 text-zinc-300' },
};

export function AdminPostPopupBadge({
  popup_actif,
  popup_debut,
  popup_fin,
}: {
  popup_actif?: boolean | null;
  popup_debut?: string | null;
  popup_fin?: string | null;
}) {
  const status = popupAdminStatus({ popup_actif, popup_debut, popup_fin });
  if (status === 'off') {
    return <span className="text-xs text-zinc-500">—</span>;
  }
  const item = LABELS[status];
  return (
    <span className={`rounded px-2 py-1 text-xs ${item.className}`}>{item.text}</span>
  );
}
