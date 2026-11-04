import { NextRequest, NextResponse } from 'next/server';

// Server-only variable; no NEXT_PUBLIC_ needed for the proxy
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

async function handleProxy(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
  }

  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const headers = new Headers();
  const auth = request.headers.get('authorization');
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
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });

    // Keep your existing error shape: { error: "..." }
    if (!response.ok) {
      const text = await response.text();
      let message = text || 'Request failed';
      try {
        const data = JSON.parse(text);
        message = data.message || data.error || message;
      } catch {}
      return NextResponse.json({ error: message }, { status: response.status });
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