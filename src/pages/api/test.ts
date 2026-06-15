// src/pages/api/test.ts
// DELETE THIS FILE after debugging — only for diagnosis
export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const url  = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const svc  = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    PUBLIC_SUPABASE_URL:       url  ? `✓ ${url.slice(0,35)}...` : '✗ MISSING',
    PUBLIC_SUPABASE_ANON_KEY:  anon ? `✓ set (${anon.slice(0,15)}...)` : '✗ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: svc  ? `✓ set (${svc.slice(0,15)}...)` : '✗ MISSING',
    mode: import.meta.env.MODE,
    ts:   new Date().toISOString(),
  };

  let db = 'not attempted';
  try {
    const { createClient } = await import('@supabase/supabase-js');
    if (url && svc) {
      const admin = createClient(url, svc, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      const { data, error } = await admin
        .from('site_content')
        .select('page,section')
        .limit(5);
      db = error
        ? `✗ DB error: ${error.message}`
        : `✓ Connected — ${data?.length ?? 0} rows: ${data?.map((r:any)=>`${r.page}/${r.section}`).join(', ')}`;
    } else {
      db = '✗ Skipped — env vars missing';
    }
  } catch (e: any) {
    db = `✗ Exception: ${e?.message ?? e}`;
  }

  return new Response(
    JSON.stringify({ env, db }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
