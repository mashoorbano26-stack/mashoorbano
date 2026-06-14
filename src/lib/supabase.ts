// src/lib/supabase.ts
// Two exports:
//   supabase        → browser client (React islands / client JS)
//   supabaseAdmin   → service-role client (server-only, bypasses RLS)
//   makeServerClient→ SSR client factory that reads/writes Astro cookies (login, middleware)

import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const URL  = import.meta.env.PUBLIC_SUPABASE_URL as string;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;
const ROLE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

/** Browser-side Supabase client — safe to use in React islands */
export const supabase = createBrowserClient(URL, ANON);

/** 
 * Server-side Supabase client — reads/writes Astro cookies so the session
 * is persisted between requests (login, middleware session checks).
 * Call this inside .astro frontmatter or API routes, passing Astro.cookies.
 */
export function makeServerClient(cookies: {
  get(key: string): { value: string } | undefined;
  set(key: string, value: string, opts?: Record<string, unknown>): void;
  delete(key: string, opts?: Record<string, unknown>): void;
}) {
  return createServerClient(URL, ANON, {
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        cookies.set(key, value, {
          ...options,
          sameSite: (options?.sameSite as string) ?? 'lax',
          secure: true,
          httpOnly: true,
        } as Record<string, unknown>);
      },
      remove(key: string, options: CookieOptions) {
        cookies.delete(key, options as Record<string, unknown>);
      },
    },
  });
}

/**
 * Admin/service-role client — bypasses RLS.
 * SERVER ONLY. Never import in React components or client scripts.
 */
export const supabaseAdmin = createClient(URL, ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});
