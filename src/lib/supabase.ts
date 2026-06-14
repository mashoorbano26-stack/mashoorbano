// src/lib/supabase.ts
// Defensive: won't crash if env vars are missing (shows clear error instead)

import { createClient as _create } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const URL  = import.meta.env.PUBLIC_SUPABASE_URL       ?? '';
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY  ?? '';
const SVC  = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Guard — logs clearly if env vars missing instead of cryptic crash
function guard(label: string, url: string, key: string) {
  if (!url || !key) {
    console.error(`[supabase] Missing env vars for ${label}. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in Cloudflare Pages → Settings → Environment Variables.`);
  }
}

// Browser anon client (safe in React .tsx)
export const supabase = (() => {
  guard('browser client', URL, ANON);
  if (!URL || !ANON) return null as any;
  return _create(URL, ANON);
})();

// Backward-compat alias — any .tsx doing import { createClient }
export function createClient() {
  guard('createClient', URL, ANON);
  if (!URL || !ANON) return null as any;
  return _create(URL, ANON);
}

// SSR server client (Astro .astro frontmatter only)
export function makeServerClient(cookies: AstroCookies) {
  guard('server client', URL, ANON);
  if (!URL || !ANON) return null as any;
  return createServerClient(URL, ANON, {
    cookies: {
      get:    (key)              => cookies.get(key)?.value,
      set:    (key, value, opts) => cookies.set(key, value, opts),
      remove: (key, opts)        => cookies.delete(key, opts),
    },
  });
}

// Admin service role (server .astro ONLY — never import in .tsx)
export const supabaseAdmin = (() => {
  if (!URL || !SVC) {
    console.error('[supabase] Missing SUPABASE_SERVICE_ROLE_KEY — set in Cloudflare Pages env vars (Production only, not public).');
    return null as any;
  }
  return _create(URL, SVC, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
})();
