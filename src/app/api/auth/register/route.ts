import { NextRequest, NextResponse } from 'next/server';
import { registerBackendSchema } from '@/lib/validation';

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
    console.log('Register request body:', body);

    // Validate with Zod schema (backend schema without confirm_password)
    const validationResult = registerBackendSchema.safeParse(body);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        const field = err.path.join(".");
        errors[field] = err.message;
      });
      console.log('Validation errors:', errors);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    console.log('Validated data:', validatedData);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validatedData.email,
        phone: validatedData.phone,
        password: validatedData.password,
      }),
    });

    // Get response text first to handle both JSON and plain text responses
    const responseText = await response.text();
    console.log('Backend response:', responseText);

    if (!response.ok) {
      // Try to parse as JSON, fall back to plain text
      let errorMessage = 'Registration failed';
      let errorDetails = undefined;
      try {
        const data = JSON.parse(responseText);
        errorMessage = data.message || data.error || errorMessage;
        errorDetails = data.details;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      return NextResponse.json(
        { error: errorMessage, details: errorDetails },
        { status: response.status }
      );
    }

    // Parse successful response as JSON
    const data = JSON.parse(responseText);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Register proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
