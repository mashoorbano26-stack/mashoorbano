// src/pages/api/test.ts — DELETE after debugging
export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const metaUrl  = import.meta.env.PUBLIC_SUPABASE_URL;
  const metaAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const metaSvc  = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const procSvc  = (typeof process !== 'undefined') ? process.env?.SUPABASE_SERVICE_ROLE_KEY : 'process undefined';
  const procUrl  = (typeof process !== 'undefined') ? process.env?.PUBLIC_SUPABASE_URL : 'process undefined';

  const env = {
    'import.meta.env.PUBLIC_SUPABASE_URL':       metaUrl  ? `✓ ${metaUrl.slice(0,35)}` : '✗ MISSING',
    'import.meta.env.PUBLIC_SUPABASE_ANON_KEY':  metaAnon ? `✓ set` : '✗ MISSING',
    'import.meta.env.SUPABASE_SERVICE_ROLE_KEY': metaSvc  ? `✓ set` : '✗ MISSING',
    'process.env.SUPABASE_SERVICE_ROLE_KEY':     procSvc  ? `✓ set` : '✗ MISSING',
    'process.env.PUBLIC_SUPABASE_URL':           procUrl  ? `✓ set` : '✗ MISSING',
    mode: import.meta.env.MODE,
    ts:   new Date().toISOString(),
  };

  // Test DB with whichever key is available
  const url = metaUrl || procUrl || '';
  const svc = metaSvc || procSvc || '';
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
      db = `✗ No valid key — url:${!!url} svc:${!!svc}`;
    }
  } catch (e: any) {
    db = `✗ Exception: ${e?.message}`;
  }

  return new Response(JSON.stringify({ env, db }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
