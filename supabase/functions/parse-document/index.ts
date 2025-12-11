import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getDocument, GlobalWorkerOptions } from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Disable worker for server-side usage
GlobalWorkerOptions.workerSrc = '';

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileName = file.name.toLowerCase();
    let extractedText = '';

    console.log('Processing file:', fileName, 'Size:', file.size);

    // Handle text files
    if (fileName.endsWith('.txt')) {
      extractedText = await file.text();
      
      if (!extractedText || extractedText.trim().length < 10) {
        return new Response(
          JSON.stringify({ error: 'File appears to be empty. Please paste the text directly.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ text: extractedText.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Handle PDF files
    else if (fileName.endsWith('.pdf')) {
      console.log('Extracting text from PDF...');
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractTextFromPDF(arrayBuffer);

      if (!extractedText || extractedText.trim().length < 10) {
        return new Response(
          JSON.stringify({ error: 'Could not extract text from PDF. The PDF may be scanned/image-based. Please paste the text directly.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('PDF text extracted successfully, length:', extractedText.length);
      return new Response(
        JSON.stringify({ text: extractedText.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // For DOCX files - provide helpful error message
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return new Response(
        JSON.stringify({ 
          error: 'DOCX parsing is not supported. Please save as PDF or paste the text directly.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Unsupported format
    else {
      return new Response(
        JSON.stringify({ error: 'Please upload a PDF or TXT file, or paste your content directly.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process file. Please paste the text directly into the text area.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
