// src/pages/api/debug.ts — shows all site_content rows + their actual content
// Visit /api/debug to see EXACTLY what Supabase returns for each section
export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const locals = context.locals as any;
  const admin = locals?.supabaseAdmin;

  if (!admin) {
    return new Response(JSON.stringify({ error: 'supabaseAdmin not in locals' }, null, 2),
      { headers: { 'Content-Type': 'application/json' } });
  }

  const result: any = {};

  // Get all site_content rows
  const { data: sc, error: scErr } = await admin
    .from('site_content')
    .select('page, section, content');
  result.site_content = scErr ? `ERROR: ${scErr.message}` : sc?.map((r: any) => ({
    key: `${r.page}/${r.section}`,
    fields: r.content ? Object.keys(r.content) : [],
    // Show specific hero fields if this is hero
    ...(r.section === 'hero' ? {
      orbital_text: r.content?.orbital_text,
      video_url: r.content?.video_url,
      auto_expand_seconds: r.content?.auto_expand_seconds,
      tagline: r.content?.tagline,
      tagline_bg: r.content?.tagline_bg,
    } : {}),
  }));

  // Count rows in each table
  for (const table of ['packages', 'testimonials', 'portfolio', 'orders', 'leads', 'blog_posts']) {
    try {
      const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
      result[table] = error ? `ERROR: ${error.message}` : `${count} rows`;
    } catch (e: any) {
      result[table] = `EXCEPTION: ${e.message}`;
    }
  }

  return new Response(JSON.stringify(result, null, 2),
    { headers: { 'Content-Type': 'application/json' } });
};
