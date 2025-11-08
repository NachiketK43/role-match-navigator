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
      resume: z.string().trim().min(1, 'Resume is required').max(50000, 'Resume too long (max 50,000 characters)'),
      jobDescription: z.string().trim().min(1, 'Job description is required').max(50000, 'Job description too long (max 50,000 characters)')
    });

    const parseResult = inputSchema.safeParse(await req.json());
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resume, jobDescription } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Optimizing resume with Lovable AI...');

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimization specialist. Your role is to analyze resumes against job descriptions and provide actionable, specific improvements.

Analyze the resume against the job description and return a JSON response with this EXACT structure:
{
  "atsScore": <number 0-100>,
  "keywordInsights": [
    {
      "keyword": "<important keyword from job description>",
      "status": "missing" | "weak" | "strong"
    }
  ],
  "suggestedRewrites": [
    {
      "before": "<original resume bullet point>",
      "after": "<improved version with quantifiable achievements and relevant keywords>",
      "improvements": ["<specific improvement 1>", "<specific improvement 2>"]
    }
  ],
  "overallFeedback": "<2-3 sentence summary of key strengths and areas for improvement>"
}

Guidelines:
- ATS score should be based on keyword match, structure, and relevance (0-100)
- Identify 5-8 critical keywords (mix of missing, weak, strong)
- Provide 3-5 before/after bullet point rewrites
- "After" versions should use action verbs, quantify achievements, and naturally incorporate keywords
- Improvements should be specific (e.g., "Added quantifiable metric", "Incorporated keyword 'agile methodology'")
- Overall feedback should be constructive and actionable`;

    const userPrompt = `Resume:
${resume}

Job Description:
${jobDescription}`;

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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
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
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI response:', content);

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);

    // Validate structure
    if (!result.atsScore || !result.keywordInsights || !result.suggestedRewrites || !result.overallFeedback) {
      console.error('Invalid result structure:', result);
      return new Response(
        JSON.stringify({ error: 'Invalid analysis format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Optimization successful, ATS score:', result.atsScore);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimize-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
