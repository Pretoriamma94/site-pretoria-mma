import { NextResponse } from 'next/server';
import { createServerAuthClient } from '@/lib/supabase/auth';

/**
 * Callback Supabase Auth (lien e-mail réinitialisation / invitation).
 * Échange le code contre une session puis redirige vers la page cible.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin/login/reset-password';

  if (code) {
    const supabase = await createServerAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const failUrl = new URL('/admin/login', origin);
  failUrl.searchParams.set('error', 'auth');
  return NextResponse.redirect(failUrl);
}
