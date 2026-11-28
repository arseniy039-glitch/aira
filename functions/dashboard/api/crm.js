// GET /dashboard/api/crm?[q=&type=&status=&limit=] → proxies panel.aira-ai.net/api/crm
// POST /dashboard/api/crm/update → update company status
// Protected by _middleware.js (Basic Auth). CRM data from /opt/aira-hub/crm.db via panel.
export async function onRequestGet({ request, env }) {
  const key = env.N8N_WEBHOOK_SECRET;
  if (!key) return new Response(JSON.stringify({ error: 'N8N_WEBHOOK_SECRET not set' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const q = new URL(request.url).search;
  const path = new URL(request.url).pathname.replace('/dashboard/api/crm', '/api/crm');
  const r = await fetch('https://panel.aira-ai.net' + path + q, { headers: { 'X-Panel-Key': key } });
  return new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
export async function onRequestPost({ request, env }) {
  const key = env.N8N_WEBHOOK_SECRET;
  if (!key) return new Response(JSON.stringify({ error: 'N8N_WEBHOOK_SECRET not set' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const body = await request.text();
  const r = await fetch('https://panel.aira-ai.net/api/crm/update', {
    method: 'POST', headers: { 'X-Panel-Key': key, 'Content-Type': 'application/json' }, body
  });
  return new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
