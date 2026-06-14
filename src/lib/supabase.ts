// src/lib/supabase.ts
// Exports THREE clients — use the right one:
//   supabase      → browser-safe anon client (React components, client-side)
//   makeServerClient(cookies) → SSR client (Astro pages frontmatter only)
//   supabaseAdmin → service role bypass (server-only, never import in .tsx)

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const SUPABASE_URL  = import.meta.env.PUBLIC_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;
const SERVICE_KEY   = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

// ── Browser client (anon key, safe in React components) ──
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Server client factory (reads/writes Astro cookies for auth) ──
export function makeServerClient(cookies: AstroCookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get:    (key)        => cookies.get(key)?.value,
      set:    (key, value, opts) => cookies.set(key, value, opts),
      remove: (key, opts)  => cookies.delete(key, opts),
    },
  });
}

// ── Admin client (service role, NEVER import in .tsx files) ──
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
