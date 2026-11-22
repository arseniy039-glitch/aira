const N8N = 'https://n8n.aira-ai.net/webhook/board-task-details';

export async function onRequestGet({ request, env }) {
  if (!env.BOARD_KEY) {
    return new Response(JSON.stringify({ authorized: false }),
      { headers: { 'Content-Type': 'application/json' } });
  }
  const q = new URL(request.url).search;
  const r = await fetch(N8N + q, { headers: { 'X-Board-Key': env.BOARD_KEY } });
  return new Response(r.body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
