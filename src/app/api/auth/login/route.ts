import { NextRequest, NextResponse } from 'next/server';
import { loginBackendSchema } from '@/lib/validation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { error: 'API URL is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate with Zod schema
    const validationResult = loginBackendSchema.safeParse(body);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        const field = err.path.join(".");
        errors[field] = err.message;
      });
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: validatedData.phone,
        password: validatedData.password,
      }),
    });

    // Get response text first to handle both JSON and plain text responses
    const responseText = await response.text();

    if (!response.ok) {
      // Try to parse as JSON, fall back to plain text
      let errorMessage = 'Login failed';
      try {
        const data = JSON.parse(responseText);
        errorMessage = data.message || data.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Parse successful response as JSON
    const data = JSON.parse(responseText);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
