const N8N = 'https://n8n.aira-ai.net/webhook/dashboard-data';

export async function onRequestGet({ env }) {
  if (!env.BOARD_KEY) {
    return new Response(JSON.stringify({ authorized: false }),
      { headers: { 'Content-Type': 'application/json' } });
  }
  const r = await fetch(N8N, { headers: { 'X-Board-Key': env.BOARD_KEY } });
  return new Response(r.body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
