import { NextRequest, NextResponse } from 'next/server';

// Server-only variable; no NEXT_PUBLIC_ needed for the proxy
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

// Short-lived cache for PUBLIC catalog endpoints only.
// Requests carrying an Authorization header are never cached, so
// user-specific data can never leak between students.
const CACHE_TTL_MS = 60_000;
const cacheablePath = /^\/programs(\/|$)/;
const publicCache = new Map<string, { body: string; contentType: string; expires: number }>();

// Strip backend URLs/hosts from error text so they never reach the browser.
function sanitizeError(message: string): string {
  return message
    .replace(/https?:\/\/[^\s"'()]+/gi, '[internal]')
    .replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/\S*)?/g, '[internal]')
    .replace(/\b[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/\S*)?/gi, (m) =>
      /\.(com|net|org|io|dev|app|et|co)(\/|$|:)/i.test(m) ? '[internal]' : m
    );
}

function isPublicCacheable(method: string, path: string, hasAuth: boolean) {
  return method === 'GET' && !hasAuth && cacheablePath.test(path);
}

async function handleProxy(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
  }

  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const auth = request.headers.get('authorization');
  const cacheable = isPublicCacheable(request.method, path, !!auth);

  if (cacheable) {
    const hit = publicCache.get(path);
    if (hit && hit.expires > Date.now()) {
      return new NextResponse(hit.body, {
        status: 200,
        headers: { 'Content-Type': hit.contentType, 'Cache-Control': 'public, max-age=60' },
      });
    }
  }

  const headers = new Headers();
  if (auth) headers.set('Authorization', auth);
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType); // keeps the multipart boundary intact

  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(request.method);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // @ts-expect-error required by Node when streaming a request body
      duplex: 'half',
      signal: AbortSignal.timeout(30000),
      cache: 'no-store',
    });

    // Keep your existing error shape: { error: "..." }
    if (!response.ok) {
      const text = await response.text();
      let message = sanitizeError(text || 'Request failed');
      try {
        const data = JSON.parse(text);
        message = sanitizeError(data.message || data.error || message);
      } catch {}
      return NextResponse.json({ error: message }, { status: response.status });
    }

    // Cacheable public GETs are buffered so they can be stored; everything
    // else keeps streaming straight through.
    if (cacheable) {
      const body = await response.text();
      const contentType = response.headers.get('content-type') ?? 'application/json';
      publicCache.set(path, { body, contentType, expires: Date.now() + CACHE_TTL_MS });
      return new NextResponse(body, {
        status: response.status,
        headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=60' },
      });
    }

    // Stream the success response straight through
    const resHeaders = new Headers();
    const ct = response.headers.get('content-type');
    if (ct) resHeaders.set('Content-Type', ct);
    const cc = response.headers.get('cache-control');
    if (cc) resHeaders.set('Cache-Control', cc);

    return new NextResponse(response.body, { status: response.status, headers: resHeaders });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Backend took too long to respond' }, { status: 504 });
    }
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;