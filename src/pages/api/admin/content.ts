export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { page, section, content } = body;

    if (!page || !section || !content) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceKey  = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    const res = await fetch(`${supabaseUrl}/rest/v1/site_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ page, section, content }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ url }) => {
  const page    = url.searchParams.get('page') || 'home';
  const section = url.searchParams.get('section');

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey     = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  let endpoint = `${supabaseUrl}/rest/v1/site_content?page=eq.${page}`;
  if (section) endpoint += `&section=eq.${section}`;

  const res = await fetch(endpoint, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
