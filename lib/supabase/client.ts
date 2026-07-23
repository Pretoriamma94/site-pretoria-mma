import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Instancie (une seule fois) le client Supabase public.
 * Création différée : évite d'exécuter createClient au chargement du module,
 * ce qui ferait échouer le pré-rendu du build (env non disponible à ce moment).
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase client: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis.',
    );
  }

  cachedClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

/**
 * Client Supabase public (côté client uniquement).
 * Utilise la clé anonyme (anon key) — sans privilèges admin.
 * À utiliser dans les Client Components et le code exécuté dans le navigateur.
 *
 * Exposé via Proxy pour une initialisation paresseuse : le vrai client n'est
 * créé qu'au premier accès (dans le navigateur), pas à l'évaluation du module.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
