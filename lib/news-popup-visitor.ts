export const NEWS_POPUP_MAX_AFFICHAGES = [1, 2, 3] as const;
export type NewsPopupMaxAffichages = (typeof NEWS_POPUP_MAX_AFFICHAGES)[number];

export const NEWS_POPUP_STATE_PREFIX = 'pretoria_news_popup_state:';
export const NEWS_POPUP_SESSION_PREFIX = 'pretoria_news_popup_session:';
export const NEWS_POPUP_DISMISS_PREFIX = 'pretoria_news_popup_dismissed:';

type VisitorState = {
  dismissed: boolean;
  count: number;
};

function stateKey(postId: string): string {
  return `${NEWS_POPUP_STATE_PREFIX}${postId}`;
}

function sessionKey(postId: string): string {
  return `${NEWS_POPUP_SESSION_PREFIX}${postId}`;
}

function dismissLegacyKey(postId: string): string {
  return `${NEWS_POPUP_DISMISS_PREFIX}${postId}`;
}

function clampMax(value: number): NewsPopupMaxAffichages {
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

function readState(postId: string): VisitorState {
  if (typeof window === 'undefined') return { dismissed: false, count: 0 };
  if (window.localStorage.getItem(dismissLegacyKey(postId)) === '1') {
    return { dismissed: true, count: 0 };
  }
  try {
    const raw = window.localStorage.getItem(stateKey(postId));
    if (!raw) return { dismissed: false, count: 0 };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return { dismissed: false, count: 0 };
    const row = parsed as Record<string, unknown>;
    return {
      dismissed: row.dismissed === true,
      count: typeof row.count === 'number' && row.count > 0 ? Math.floor(row.count) : 0,
    };
  } catch {
    return { dismissed: false, count: 0 };
  }
}

function writeState(postId: string, state: VisitorState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(stateKey(postId), JSON.stringify(state));
}

function alreadyShownThisSession(postId: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(sessionKey(postId)) === '1';
}

function markShownThisSession(postId: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(sessionKey(postId), '1');
}

const runtimeShown = new Set<string>();

/** Ferme = plus jamais. Sinon plafond de visites (1–3). Une visite = une session navigateur. */
export function shouldShowNewsPopup(postId: string, maxAffichages: number): boolean {
  const max = clampMax(maxAffichages);
  const state = readState(postId);
  if (state.dismissed) return false;
  if (runtimeShown.has(postId)) return true;
  if (alreadyShownThisSession(postId)) return false;
  return state.count < max;
}

export function recordNewsPopupImpression(postId: string): void {
  runtimeShown.add(postId);
  if (alreadyShownThisSession(postId)) return;
  const state = readState(postId);
  if (state.dismissed) return;
  writeState(postId, { dismissed: false, count: state.count + 1 });
  markShownThisSession(postId);
}

export function dismissNewsPopup(postId: string): void {
  if (typeof window === 'undefined') return;
  runtimeShown.delete(postId);
  const state = readState(postId);
  writeState(postId, { dismissed: true, count: state.count });
  markShownThisSession(postId);
}

export function parseMaxAffichages(raw: unknown): NewsPopupMaxAffichages {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 1;
  return clampMax(n);
}
