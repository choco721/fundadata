import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { DEMO_MODE } from './demo/demoMode';
import { createMockClient } from './demo/mockClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!DEMO_MODE && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Supabase URL or Anon Key is missing in environment variables (.env.local)');
}

// En modo demo se devuelve un cliente falso con datos en memoria. Es el único
// punto del proyecto donde se crea el cliente, así que interceptar acá cubre el
// 100% de los accesos a datos sin tocar ninguna pantalla. Ver src/demo/.
// El mock no hace ni una request de red: la base real es inalcanzable desde la demo.

// El tipo se declara explícitamente para que el mock no ensanche `supabase` a
// `any` y la app pierda la inferencia de tipos en todos los callbacks.
// Main Supabase client (persists auth in localStorage)
export const supabase: SupabaseClient = DEMO_MODE
  ? (createMockClient() as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

// Helper function to create a secondary, isolated Supabase client.
// Used by Foundation users to register operator users via auth.signUp
// without logging out the currently authenticated admin session.
export const createSecondaryClient = (): SupabaseClient => {
  // El mock comparte el store en memoria, así que el operador que se crea acá
  // aparece en la tabla que lee el cliente principal.
  if (DEMO_MODE) return createMockClient() as SupabaseClient;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
