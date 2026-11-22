// Block internal files from public access.
// llms.txt and robots.txt are intentionally public.
const BLOCKED = [
  /^\/config\.json$/,
  /\.md$/i,
  /^\/package(-lock)?\.json$/,
  /^\/playwright\.config\.(js|ts)$/,
  /^\/tests\//,
  /^\/test-results\//,
  /^\/_reports\//,
  /^\/_screens\//,
  /^\/aira-react\.jsx$/,
  /\.bak/i,
];
const ALWAYS_PUBLIC = [/^\/llms\.txt$/, /^\/robots\.txt$/];

export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  if (ALWAYS_PUBLIC.some(re => re.test(path))) return context.next();
  if (BLOCKED.some(re => re.test(path))) return new Response('Not Found', { status: 404 });
  return context.next();
}
