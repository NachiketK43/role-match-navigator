import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Handle text files
    if (fileName.endsWith('.txt')) {
      extractedText = await file.text();
    } 
    // Handle PDF files - using dynamic import to avoid build errors
    else if (fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Import pdf-parse dynamically from esm.sh
        const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
        const data = await pdfParse.default(new Uint8Array(arrayBuffer));
        extractedText = data.text || '';
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to extract PDF text. The PDF might be scanned or image-based. Please try converting it to text first or paste the content manually.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    // Handle DOCX files
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Import mammoth dynamically from esm.sh for DOCX parsing
        const mammoth = await import('https://esm.sh/mammoth@1.6.0');
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || '';
      } catch (docError) {
        console.error('DOCX parsing error:', docError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to extract DOCX text. Please try converting it to text first or paste the content manually.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    // Unsupported format
    else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Could not extract meaningful text from the file. Please check the file content or paste the text manually.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text: extractedText.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error parsing document:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to parse document' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
