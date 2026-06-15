// src/middleware.ts
// KEY FIX: Cloudflare Pages passes secrets via runtime context (Astro.locals.runtime.env)
// NOT via import.meta.env or process.env for non-PUBLIC_ vars
// This middleware extracts the service role key from runtime and stores in locals

import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect, locals } = context;

  // ── Extract Cloudflare runtime env (where secrets actually live) ──
  const runtime = (context as any).locals?.runtime
    ?? (context as any).runtime
    ?? {};
  const cfEnv = runtime?.env ?? {};

  const SUPABASE_URL  = import.meta.env.PUBLIC_SUPABASE_URL       || cfEnv.PUBLIC_SUPABASE_URL  || '';
  const SUPABASE_ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY  || cfEnv.PUBLIC_SUPABASE_ANON_KEY || '';
  const SERVICE_KEY   = cfEnv.SUPABASE_SERVICE_ROLE_KEY
    || import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    || (typeof process !== 'undefined' ? process.env?.SUPABASE_SERVICE_ROLE_KEY : '')
    || '';

  // Store on locals so every .astro page can access without re-reading env
  (locals as any).supabaseUrl        = SUPABASE_URL;
  (locals as any).supabaseAnon       = SUPABASE_ANON;
  (locals as any).supabaseServiceKey = SERVICE_KEY;

  // Make supabaseAdmin available to all pages via locals
  if (SUPABASE_URL && SERVICE_KEY) {
    (locals as any).supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  // ── Admin route guard ──────────────────────────────────────────
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON) return redirect('/admin/login');
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
        cookies: {
          get:    (key)              => cookies.get(key)?.value,
          set:    (key, value, opts) => cookies.set(key, value, opts),
          remove: (key, opts)        => cookies.delete(key, opts),
        },
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return redirect('/admin/login');
    } catch (e) {
      console.error('[middleware] auth error:', e);
      return redirect('/admin/login');
    }
  }

  const response = await next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Prevent stale HTML — SSR content must always be fresh
  const ct = response.headers.get('content-type') ?? '';
  if (ct.includes('text/html')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
  }
  return response;
});
