import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { isAdminAuthBypassed } from '@/lib/supabase/admin-bypass';

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase auth: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis.',
    );
  }

  return { url, anonKey };
}

/** Client serveur lié à la session cookie — Server Components / Server Actions. */
export async function createServerAuthClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  const cookieStore = await cookies();

  return createSSRServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // set depuis un Server Component en lecture seule : ignoré (le middleware rafraîchit la session).
        }
      },
    },
  });
}

const DEV_BYPASS_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'dev-admin@localhost',
  app_metadata: { role: 'admin' },
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date(0).toISOString(),
} as User;

export function isAdminUser(user: User | null | undefined): boolean {
  if (isAdminAuthBypassed()) return true;
  return user?.app_metadata?.role === 'admin';
}

export async function getAuthUser(): Promise<User | null> {
  if (isAdminAuthBypassed()) return DEV_BYPASS_USER;
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Vérifie qu'un admin est connecté.
 * À appeler avant toute action admin (même si le data access utilise encore le service role).
 */
export async function requireAdmin(): Promise<User> {
  if (isAdminAuthBypassed()) return DEV_BYPASS_USER;
  const user = await getAuthUser();
  if (!user || !isAdminUser(user)) {
    throw new Error('Accès administrateur requis.');
  }
  return user;
}
