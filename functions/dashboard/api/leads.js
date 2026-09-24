// GET /dashboard/api/leads?<same query as lisbon-leads-data> -> n8n lisbon-leads-data with X-Aira-Key
// from env, so Scout leads are served only behind Basic Auth (functions/dashboard/_middleware.js).
// Without AIRA_LEADS_KEY the webhook answers as for a public caller (Fixando only).
export async function onRequestGet({ request, env }) {
  const q = new URL(request.url).search;
  const headers = env.AIRA_LEADS_KEY ? { 'X-Aira-Key': env.AIRA_LEADS_KEY } : {};
  const r = await fetch('https://n8n.aira-ai.net/webhook/lisbon-leads-data' + q, { headers });
  return new Response(r.body, {
    status: r.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Leads-Key': env.AIRA_LEADS_KEY ? 'set' : 'missing',
    },
  });
}
