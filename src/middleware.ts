// src/middleware.ts
// 1. Adds security headers to every response
// 2. Guards /admin/* — redirects to /admin/login if no valid Supabase session
// Uses makeServerClient so Supabase can read/write cookies correctly (fixes login loop)

import { defineMiddleware } from 'astro:middleware';
import { makeServerClient } from '@/lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect } = context;

  // ── Admin route guard ──────────────────────────────────────────────────────
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const supabase = makeServerClient(cookies);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return redirect('/admin/login');
  }

  const response = await next();

  // ── Security headers ───────────────────────────────────────────────────────
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
});
