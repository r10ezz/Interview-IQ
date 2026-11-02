import { extractText } from 'unpdf';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts plain text from an uploaded PDF Buffer or Uint8Array.
 * Uses `unpdf` which runs in Node.js server environments without native binary bindings.
 */
export async function extractTextFromPDF(
  buffer: ArrayBuffer | Uint8Array | Buffer
): Promise<PDFExtractionResult> {
  try {
    // pdfjs specifically rejects Node.js Buffer instances and requires a clean Uint8Array
    let pureUint8: Uint8Array;
    if (buffer instanceof ArrayBuffer) {
      pureUint8 = new Uint8Array(buffer);
    } else {
      pureUint8 = new Uint8Array(buffer.byteLength);
      pureUint8.set(buffer);
    }

    const result = await extractText(pureUint8);
    const pages = Array.isArray(result.text) ? result.text : [result.text];
    const joinedText = pages.join('\n\n').trim();

    // Clean up excessive whitespace and normalize line breaks
    const cleanedText = joinedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      text: cleanedText,
      pageCount: result.totalPages || pages.length,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to parse PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
