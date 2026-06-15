// src/lib/supabase.ts
// Cloudflare Pages: service role key ONLY available via runtime.env context
// Passed to pages via Astro.locals (set in middleware.ts)
// This file provides helpers that work in BOTH local dev and Cloudflare

import { createClient as _create } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// PUBLIC_ vars — available everywhere via import.meta.env (Vite bakes them in)
const URL  = import.meta.env.PUBLIC_SUPABASE_URL      ?? '';
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

// Service key — only available locally via import.meta.env
// On Cloudflare it comes through Astro.locals (set by middleware from runtime.env)
const LOCAL_SVC = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Browser anon client
export const supabase = URL && ANON ? _create(URL, ANON) : (null as any);

// Backward compat alias
export function createClient() {
  return URL && ANON ? _create(URL, ANON) : (null as any);
}

// SSR auth client using cookies
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

// Admin client — for local dev only (Cloudflare uses Astro.locals.supabaseAdmin)
export const supabaseAdmin = (() => {
  if (!URL || !LOCAL_SVC) return null as any;
  return _create(URL, LOCAL_SVC, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
})();

// Helper: get admin client from either locals (Cloudflare) or module singleton (local dev)
export function getAdmin(locals: Record<string, any>) {
  return (locals?.supabaseAdmin) ?? supabaseAdmin;
}
