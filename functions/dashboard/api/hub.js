// GET /dashboard/api/hub → proxies aira-dashboard-data with BOARD_KEY from env.
// Protected by functions/dashboard/_middleware.js (Basic Auth).
export async function onRequestGet({ env }) {
  const key = env.BOARD_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'BOARD_KEY not set' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const r = await fetch('https://n8n.aira-ai.net/webhook/dashboard-data', {
    headers: { 'x-board-key': key },
  });
  return new Response(r.body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
