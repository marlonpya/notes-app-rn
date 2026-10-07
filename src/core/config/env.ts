// Las variables EXPO_PUBLIC_* se incrustan en el bundle en tiempo de build.
// Nunca pongas aquí claves secretas (service_role): solo la publishable key de Supabase.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copia .env.example a .env y complétalo.',
  );
}

export const env = { supabaseUrl, supabasePublishableKey } as const;
