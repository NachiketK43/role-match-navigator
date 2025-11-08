import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inputSchema = z.object({
      targetRole: z.string().trim().min(1, 'Target role is required').max(200, 'Target role too long'),
      targetCompany: z.string().trim().min(1, 'Target company is required').max(200, 'Target company too long'),
      jobDescription: z.string().trim().min(1, 'Job description is required').max(50000, 'Job description too long (max 50,000 characters)'),
      template: z.enum(['professional', 'passionate', 'data-driven', 'creative'], {
        errorMap: () => ({ message: 'Invalid template type' })
      })
    });

    const parseResult = inputSchema.safeParse(await req.json());
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetRole, targetCompany, jobDescription, template } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateInstructions = {
      professional: 'Professional, formal, traditional business tone. Use formal language and structure.',
      passionate: 'Enthusiastic, engaging, showing genuine interest and excitement for the role and company.',
      'data-driven': 'Metrics-focused, achievement-oriented, emphasizing quantifiable results and specific accomplishments.',
      creative: 'Unique, innovative approach with creative storytelling while maintaining professionalism.'
    };

    const systemPrompt = `You are an expert cover letter writer specializing in creating compelling, personalized cover letters that help candidates stand out.

Your task is to generate a cover letter with the following style: ${templateInstructions[template as keyof typeof templateInstructions]}

Guidelines:
- Address the specific role (${targetRole}) and company (${targetCompany})
- Demonstrate knowledge of the company and genuine interest in the role
- Highlight relevant skills and experiences that match the job description
- Use specific examples and achievements when possible
- Match the company culture/tone inferred from the job description
- Include a strong opening that grabs attention
- Include a confident, action-oriented closing paragraph
- Keep it concise (300-400 words)
- Make it feel personal and authentic, not generic
- Use proper cover letter format with greeting and signature placeholders`;

    const userPrompt = `Generate a ${template} cover letter for:

**TARGET ROLE:**
${targetRole}

**TARGET COMPANY:**
${targetCompany}

**JOB DESCRIPTION:**
${jobDescription}

Return ONLY the cover letter text (no JSON, no markdown formatting, just the letter).`;

    console.log('Calling Lovable AI for cover letter generation...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        const retryAfter = aiResponse.headers.get('Retry-After') || aiResponse.headers.get('X-RateLimit-Reset');
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : null;
        
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            retryAfter: retryAfterSeconds 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate cover letters' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const coverLetter = aiData.choices?.[0]?.message?.content;

    if (!coverLetter) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated cover letter');

    return new Response(
      JSON.stringify({ coverLetter: coverLetter.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
