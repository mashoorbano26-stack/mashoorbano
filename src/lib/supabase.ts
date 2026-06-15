// src/lib/supabase.ts
// Cloudflare Pages fix: use process.env for server-only secrets
// (import.meta.env does NOT expose non-PUBLIC_ secrets at runtime on Cloudflare)

import { createClient as _create } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// PUBLIC_ vars work with import.meta.env (Vite replaces them at build time)
const URL  = import.meta.env.PUBLIC_SUPABASE_URL       ?? '';
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY  ?? '';

// Non-PUBLIC secret: must use process.env on Cloudflare Workers runtime
// import.meta.env does NOT receive this at runtime — only process.env does
const SVC  = (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY)
  || import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  || '';

// Browser anon client (safe in React .tsx)
export const supabase = URL && ANON ? _create(URL, ANON) : (null as any);

// Backward-compat alias for any .tsx importing { createClient }
export function createClient() {
  return URL && ANON ? _create(URL, ANON) : (null as any);
}

// SSR server client (Astro .astro frontmatter only)
export function makeServerClient(cookies: AstroCookies) {
  if (!URL || !ANON) return null as any;
  return createServerClient(URL, ANON, {
    cookies: {
      get:    (key)              => cookies.get(key)?.value,
      set:    (key, value, opts) => cookies.set(key, value, opts),
      remove: (key, opts)        => cookies.delete(key, opts),
    },
  });
}

// Admin service role — uses process.env for Cloudflare runtime compatibility
export const supabaseAdmin = (() => {
  if (!URL || !SVC) {
    console.error('[supabase] supabaseAdmin: missing URL or SERVICE_ROLE_KEY');
    return null as any;
  }
  return _create(URL, SVC, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
})();
