export function onRequestGet() {
  return Response.json({
    ok: true,
    service: 'sales-prompt-studio',
    runtime: 'cloudflare-pages-functions',
  });
}

export function onRequest() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'GET' },
  });
}
