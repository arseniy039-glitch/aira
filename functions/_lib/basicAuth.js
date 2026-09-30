// Credentials come from Pages secrets DASH_USER / DASH_PASS (wrangler pages secret put),
// so nothing secret lives in this repo. If either secret is missing, access is denied.

async function sha256(str) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)));
}

// Compare digests so timing doesn't depend on where the strings differ.
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function requireBasicAuth(request, env) {
  const user = env && env.DASH_USER;
  const pass = env && env.DASH_PASS;
  if (!user || !pass) return false;

  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Basic\s+(.+)$/i);
  if (!match) return false;

  let decoded;
  try {
    decoded = atob(match[1]);
  } catch {
    return false;
  }

  return safeEqual(decoded, `${user}:${pass}`);
}

export function unauthorizedResponse() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Aira Ops Dashboard"' },
  });
}
