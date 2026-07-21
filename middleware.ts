import { NextResponse, type NextRequest } from 'next/server';
import { getMiddlewareUser } from '@/lib/supabase/middleware';
import { isAdminAuthBypassed } from '@/lib/supabase/admin-bypass';

function isAdminRole(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  return user?.app_metadata?.role === 'admin';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isPublicAuthRoute =
    pathname === '/admin/login' || pathname.startsWith('/admin/login/');

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  /** Dev local : accès admin sans connexion (pas d’e-mail client). */
  if (isAdminAuthBypassed()) {
    if (isPublicAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  const { user, response } = await getMiddlewareUser(request);

  if (isPublicAuthRoute) {
    if (pathname === '/admin/login' && user && isAdminRole(user)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAdminRole(user)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    redirectUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
