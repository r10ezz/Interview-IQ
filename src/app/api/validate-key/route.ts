import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a valid Google Gemini API Key.' },
        { status: 400 }
      );
    }

    const result = await validateApiKey(apiKey.trim());

    if (result.valid) {
      return NextResponse.json({ valid: true, message: result.message });
    } else {
      return NextResponse.json({ valid: false, message: result.message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    );
  }
}
