// Serve config.json behind the dashboard Basic Auth middleware.
// Browsers re-send stored credentials for same-realm requests.
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/config.json';
  return context.env.ASSETS.fetch(new Request(url.toString(), context.request));
}
