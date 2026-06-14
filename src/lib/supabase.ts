// src/lib/supabase.ts
// Exports all clients — named to be backward compatible with any existing .tsx files
// that import { createClient } from '@/lib/supabase'

import { createClient as _createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const SUPABASE_URL  = import.meta.env.PUBLIC_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;
const SERVICE_KEY   = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

// ── Browser anon client (safe in React .tsx, 'use client') ──────
export const supabase = _createSupabaseClient(SUPABASE_URL, SUPABASE_ANON);

// ── Backward-compat alias: any .tsx that does
//    import { createClient } from '@/lib/supabase'
//    will get the browser anon client (safe, no server-only vars) ──
export function createClient() {
  return _createSupabaseClient(SUPABASE_URL, SUPABASE_ANON);
}

// ── SSR server client (Astro .astro frontmatter only) ────────────
export function makeServerClient(cookies: AstroCookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get:    (key)             => cookies.get(key)?.value,
      set:    (key, value, opts) => cookies.set(key, value, opts),
      remove: (key, opts)        => cookies.delete(key, opts),
    },
  });
}

// ── Admin / service role (server .astro ONLY — never import in .tsx) ──
export const supabaseAdmin = _createSupabaseClient(
  SUPABASE_URL,
  SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
