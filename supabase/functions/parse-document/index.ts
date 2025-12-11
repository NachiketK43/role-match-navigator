import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function extractTextFromPDFWithAI(arrayBuffer: ArrayBuffer, fileName: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('AI service not configured');
  }

  // Convert ArrayBuffer to base64
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64Data = btoa(binary);

  console.log('Sending PDF to AI for text extraction...');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text content from this PDF document. Return ONLY the extracted text, preserving the structure and formatting as much as possible. Do not add any commentary, explanations, or markdown formatting. Just return the raw text content from the document.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64Data}`
              }
            }
          ]
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add credits to continue.');
    }
    
    throw new Error('Failed to process PDF with AI');
  }

  const aiData = await response.json();
  const extractedText = aiData.choices?.[0]?.message?.content;

  if (!extractedText) {
    throw new Error('No text could be extracted from the PDF');
  }

  return extractedText.trim();
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

      console.log('Text file processed successfully');
      return new Response(
        JSON.stringify({ text: extractedText.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Handle PDF files using AI
    else if (fileName.endsWith('.pdf')) {
      // Check file size (max 10MB for AI processing)
      if (file.size > 10 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'PDF file is too large. Maximum size is 10MB.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Extracting text from PDF using AI...');
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractTextFromPDFWithAI(arrayBuffer, fileName);

      if (!extractedText || extractedText.trim().length < 10) {
        return new Response(
          JSON.stringify({ error: 'Could not extract text from PDF. The PDF may be image-based or corrupted. Please paste the text directly.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('PDF text extracted successfully, length:', extractedText.length);
      return new Response(
        JSON.stringify({ text: extractedText.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // For DOCX files
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return new Response(
        JSON.stringify({ 
          error: 'DOCX files are not supported. Please save as PDF or paste the text directly.' 
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
