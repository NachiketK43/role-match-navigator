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
    const { resume, jobDescription, systemPrompt } = await req.json();

    if (!resume || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Resume and job description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing resume optimization with OpenAI...');

    // Default system prompt if none provided
    const defaultSystemPrompt = `You are an expert resume writer and career coach. Your task is to optimize the given resume to better match the target job description while maintaining authenticity and accuracy.

Instructions:
1. Analyze the job description to identify key requirements, skills, and keywords
2. Rewrite the resume to better highlight relevant experience and skills
3. Incorporate important keywords naturally throughout the resume
4. Improve bullet points with action verbs and quantifiable achievements
5. Ensure the resume is ATS-friendly
6. Maintain a professional tone and formatting

Return ONLY the optimized resume text, formatted professionally. Do not include any explanations or commentary.`;

    const finalSystemPrompt = systemPrompt?.trim() || defaultSystemPrompt;

    const userPrompt = `Please optimize the following resume for the target job description.

=== CURRENT RESUME ===
${resume}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

=== OUTPUT ===
Provide the optimized resume below:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid OpenAI API key. Please check your API key.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process with OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const optimizedResume = data.choices?.[0]?.message?.content;

    if (!optimizedResume) {
      console.error('No content in OpenAI response');
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Resume optimization successful');

    return new Response(
      JSON.stringify({ optimizedResume: optimizedResume.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimize-resume-openai function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
