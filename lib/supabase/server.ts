import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Crée un client Supabase serveur avec la clé service role.
 * À utiliser uniquement côté serveur (Server Components, API routes, Server Actions).
 * Ne jamais importer ce module depuis du code exécuté côté client.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase server: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
