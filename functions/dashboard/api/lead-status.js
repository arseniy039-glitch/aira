// POST /dashboard/api/lead-status -> n8n lisbon-leads-status with X-Aira-Key from env.
// Basic Auth is enforced by functions/dashboard/_middleware.js.
export async function onRequestPost({ request, env }) {
  if (!env.AIRA_LEADS_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'AIRA_LEADS_KEY not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }
  const r = await fetch('https://n8n.aira-ai.net/webhook/lisbon-leads-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Aira-Key': env.AIRA_LEADS_KEY },
    body: await request.text(),
  });
  return new Response(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}
