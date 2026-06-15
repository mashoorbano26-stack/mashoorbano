// src/pages/api/test.ts — DELETE after confirming Supabase works
export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const locals = context.locals as any;

  // Check all possible sources
  const runtime = locals?.runtime ?? (context as any).runtime ?? {};
  const cfEnv   = runtime?.env ?? {};

  const sources = {
    'import.meta PUBLIC_SUPABASE_URL':      import.meta.env.PUBLIC_SUPABASE_URL      ? '✓' : '✗',
    'import.meta PUBLIC_SUPABASE_ANON_KEY': import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗',
    'import.meta SUPABASE_SERVICE_ROLE_KEY':import.meta.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
    'process.env SERVICE_ROLE_KEY':         (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) ? '✓' : '✗',
    'runtime.env SERVICE_ROLE_KEY':         cfEnv?.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
    'locals.supabaseAdmin':                 locals?.supabaseAdmin ? '✓ (set by middleware)' : '✗',
    'locals.supabaseServiceKey':            locals?.supabaseServiceKey ? '✓' : '✗',
    mode: import.meta.env.MODE,
    ts:   new Date().toISOString(),
  };

  // Try DB using locals.supabaseAdmin (set by middleware from runtime.env)
  let db = 'not attempted';
  const admin = locals?.supabaseAdmin;
  if (admin) {
    try {
      const { data, error } = await admin
        .from('site_content')
        .select('page,section')
        .limit(5);
      db = error
        ? `✗ ${error.message}`
        : `✓ Connected — ${data?.length} rows: ${data?.map((r:any)=>`${r.page}/${r.section}`).join(', ')}`;
    } catch (e: any) {
      db = `✗ Exception: ${e?.message}`;
    }
  } else {
    db = '✗ No supabaseAdmin in locals — middleware may not be running';
  }

  return new Response(JSON.stringify({ sources, db }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
