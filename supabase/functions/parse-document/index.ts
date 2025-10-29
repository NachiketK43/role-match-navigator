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
    // For PDF and DOCX files - provide helpful error message
    else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return new Response(
        JSON.stringify({ 
          error: 'PDF and DOCX parsing is currently unavailable. Please copy the text from your document and paste it directly into the text area.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Unsupported format
    else {
      return new Response(
        JSON.stringify({ error: 'Please upload a .txt file or paste your content directly into the text area.' }),
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
