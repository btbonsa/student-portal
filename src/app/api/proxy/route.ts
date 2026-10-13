import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  return handleProxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxy(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleProxy(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request, 'DELETE');
}

async function handleProxy(request: NextRequest, method: string) {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { error: 'API URL is not configured' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {};

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const contentType = request.headers.get('content-type');
    let body;

    if (method !== 'GET' && method !== 'DELETE') {
      if (contentType && contentType.includes('multipart/form-data')) {
        // For FormData, forward the body as-is and let browser set Content-Type
        body = await request.formData();
        // Don't set Content-Type header for FormData - let the browser set it with boundary
      } else {
        headers['Content-Type'] = 'application/json';
        body = await request.json();
      }
    }

    console.log(`Proxying ${method} to ${API_URL}${path}`, {
      hasBody: !!body,
      bodyType: body instanceof FormData ? 'FormData' : typeof body,
      contentType: headers['Content-Type'] || contentType
    });

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    const responseContentType = response.headers.get('content-type');
    let data;

    if (responseContentType && responseContentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error('Proxy error response:', {
        status: response.status,
        data
      });
      return NextResponse.json(
        { error: typeof data === 'string' ? data : (data.message || data.error || 'Request failed') },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
