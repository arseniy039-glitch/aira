export async function onRequest() {
  return new Response('Forbidden', { status: 403 });
}
