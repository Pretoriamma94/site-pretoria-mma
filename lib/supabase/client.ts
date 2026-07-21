import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase client: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis.'
  );
}

/**
 * Client Supabase public (côté client uniquement).
 * Utilise la clé anonyme (anon key) — sans privilèges admin.
 * À utiliser dans les Client Components et le code exécuté dans le navigateur.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
