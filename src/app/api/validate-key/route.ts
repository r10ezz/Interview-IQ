import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/gemini';

export async function GET() {
  const envKey = process.env.GEMINI_API_KEY;
  const isLockedIn = Boolean(envKey && envKey.trim().length > 10 && envKey !== 'your_gemini_api_key_here');
  return NextResponse.json({
    lockedIn: isLockedIn,
    maskedKey: isLockedIn ? `${envKey!.trim().slice(0, 10)}...${envKey!.trim().slice(-4)}` : null,
    message: isLockedIn ? 'Gemini API is locked in and active via server environment' : 'No server Gemini API key configured',
  });
}

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
