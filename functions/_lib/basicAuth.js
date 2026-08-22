// SHA-256 hex digest of the expected "user:pass" string — not the plaintext,
// so credentials aren't sitting in the clear in a repo pushed to GitHub.
const CREDENTIAL_HASH = '6e20a06be749c17a436ebcf95cddcadad61a24a96dedce1868ce5097149da5d5';

async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function requireBasicAuth(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Basic\s+(.+)$/i);
  if (!match) return false;

  let decoded;
  try {
    decoded = atob(match[1]);
  } catch {
    return false;
  }

  const hash = await sha256Hex(decoded);
  return hash === CREDENTIAL_HASH;
}

export function unauthorizedResponse() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Aira Ops Dashboard"' },
  });
}
