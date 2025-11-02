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
    const { resume, jobDescription, analysisResult } = await req.json();

    if (!resume || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Resume and job description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert cover letter writer specializing in creating compelling, personalized cover letters that help candidates stand out.

Your task is to generate THREE distinct versions of a cover letter, each with a different tone:

1. **Conservative** - Professional, formal, traditional business tone
2. **Passionate** - Enthusiastic, engaging, showing genuine interest
3. **Data-Driven** - Metrics-focused, achievement-oriented, quantifiable results

For each version:
- Address the specific role and company (extract from job description)
- Highlight the candidate's top strengths from the resume analysis
- Reference specific achievements and experience from the resume
- Address any gaps or missing keywords constructively
- Match the company culture/tone inferred from the job description
- Include a strong, confident closing paragraph
- Keep it concise (300-400 words)
- Make it feel personal and authentic, not generic`;

    const userPrompt = `Generate three cover letter variations based on:

**RESUME:**
${resume}

**JOB DESCRIPTION:**
${jobDescription}

${analysisResult ? `**ANALYSIS INSIGHTS:**
- ATS Score: ${analysisResult.atsScore}%
- Strengths: ${analysisResult.keywordInsights?.filter((k: any) => k.status === 'strong').map((k: any) => k.keyword).join(', ') || 'N/A'}
- Missing Keywords: ${analysisResult.keywordInsights?.filter((k: any) => k.status === 'missing').map((k: any) => k.keyword).join(', ') || 'N/A'}
- Overall Feedback: ${analysisResult.overallFeedback || 'N/A'}` : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "conservative": "full cover letter text here",
  "passionate": "full cover letter text here",
  "dataDriven": "full cover letter text here"
}`;

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
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
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
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the AI response - handle potential markdown code blocks
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const coverLetters = JSON.parse(cleanedContent);

    console.log('Successfully generated cover letters');

    return new Response(
      JSON.stringify({ coverLetters }),
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
