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
    // Handle PDF files
    else if (fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const response = await fetch('https://pdf-extract.deno.dev/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: arrayBuffer,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract PDF text');
      }
      
      const data = await response.json();
      extractedText = data.text || '';
    }
    // Handle DOCX files
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const arrayBuffer = await file.arrayBuffer();
      
      // Use a simple text extraction approach for DOCX
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = textDecoder.decode(uint8Array);
      
      // Basic cleanup - remove XML tags and special characters
      extractedText = rawText
        .replace(/<[^>]*>/g, ' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    // Unsupported format
    else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!extractedText || extractedText.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Could not extract text from the file. Please try a different format or paste the text manually.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
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
