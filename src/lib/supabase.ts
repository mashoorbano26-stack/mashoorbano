// src/lib/supabase.ts
// Bulletproof Supabase clients for local dev AND Cloudflare Pages SSR

import { createClient as _create } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const URL  = import.meta.env.PUBLIC_SUPABASE_URL      ?? '';
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const LOCAL_SVC = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const supabase = URL && ANON ? _create(URL, ANON) : (null as any);

export function createClient() {
  return URL && ANON ? _create(URL, ANON) : (null as any);
}

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

// Local-dev singleton (works because import.meta.env has the key locally)
export const supabaseAdmin = (URL && LOCAL_SVC)
  ? _create(URL, LOCAL_SVC, { auth: { autoRefreshToken: false, persistSession: false } })
  : (null as any);

// getAdmin: resolves admin client from the best available source
//   1. locals.supabaseAdmin (set by middleware from Cloudflare runtime.env)
//   2. locals.runtime.env service key (Cloudflare, direct)
//   3. module singleton (local dev via import.meta.env)
export function getAdmin(locals?: Record<string, any>) {
  // 1. Middleware already built it
  if (locals?.supabaseAdmin) return locals.supabaseAdmin;

  // 2. Build from Cloudflare runtime env directly
  const cfEnv = locals?.runtime?.env ?? {};
  const url  = cfEnv.PUBLIC_SUPABASE_URL || URL;
  const svc  = cfEnv.SUPABASE_SERVICE_ROLE_KEY || LOCAL_SVC;
  if (url && svc) {
    return _create(url, svc, { auth: { autoRefreshToken: false, persistSession: false } });
  }

  // 3. Local dev singleton
  if (supabaseAdmin) return supabaseAdmin;

  // Nothing available — log loudly
  console.error('[supabase] getAdmin: no credentials available. locals.supabaseAdmin missing, runtime.env empty, and import.meta.env.SUPABASE_SERVICE_ROLE_KEY unset.');
  return null as any;
}
