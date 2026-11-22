// Proxy board-data requests to n8n, adding BOARD_KEY from env.
// BOARD_KEY must be set in Cloudflare Pages env (Settings > Environment variables).
const N8N = 'https://n8n.aira-ai.net/webhook/board-data';

export async function onRequestGet({ env }) {
  if (!env.BOARD_KEY) {
    return new Response(JSON.stringify({ authorized: false, error: 'BOARD_KEY not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
  const r = await fetch(N8N, { headers: { 'X-Board-Key': env.BOARD_KEY } });
  return new Response(r.body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.BOARD_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'BOARD_KEY not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
  const r = await fetch(N8N, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Board-Key': env.BOARD_KEY },
    body: await request.text(),
  });
  return new Response(r.body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
