import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { analyzeCandidate } from '@/lib/gemini';


const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let resumeText = '';
    let jobDescription = '';
    let customApiKey: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      jobDescription = (formData.get('jobDescription') as string) || '';
      customApiKey = (formData.get('customApiKey') as string) || undefined;

      const file = formData.get('resume') as File | null;
      const rawResumeText = formData.get('resumeText') as string | null;

      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            { error: 'PDF file size exceeds maximum limit of 5MB.' },
            { status: 400 }
          );
        }

        // Validate MIME type or file extension
        if (file.type && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
          return NextResponse.json(
            { error: 'Invalid file format. Please upload a valid PDF document.' },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const extraction = await extractTextFromPDF(arrayBuffer);
        resumeText = extraction.text;
      } else if (rawResumeText && rawResumeText.trim().length > 0) {
        resumeText = rawResumeText.trim();
      }
    } else {
      const json = await req.json();
      resumeText = json.resumeText || '';
      jobDescription = json.jobDescription || '';
      customApiKey = json.customApiKey;
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a valid resume with readable text content.' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a detailed job description (minimum 20 characters).' },
        { status: 400 }
      );
    }

    const { analysis, source } = await analyzeCandidate(
      resumeText,
      jobDescription,
      customApiKey
    );

    return NextResponse.json({
      success: true,
      resumeText,
      candidateAnalysis: analysis,
      source,
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze resume and job description.' },
      { status: 500 }
    );
  }
}
