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
    const { resume, jobDescription, skillGaps } = await req.json();

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

    const systemPrompt = `You are an expert interview coach specializing in helping candidates prepare for job interviews.

Your task is to:
1. Generate 8-12 realistic interview questions that this candidate is likely to face
2. Provide AI-coached sample answers using the STAR method (Situation, Task, Action, Result)
3. Identify key weak areas the candidate should focus on based on gaps

Split questions into:
- Behavioral Questions (5-6): teamwork, leadership, communication, problem-solving, conflict resolution
- Technical/Role-Specific Questions (5-6): based on job requirements, tools, methodologies

For each answer:
- Use STAR method format
- Make it realistic and tailored to the candidate's background
- Include specific, actionable coaching tips
- Keep answers concise (150-200 words)`;

    const userPrompt = `Generate interview questions and coached answers based on:

**RESUME:**
${resume}

**JOB DESCRIPTION:**
${jobDescription}

${skillGaps ? `**IDENTIFIED SKILL GAPS:**
${JSON.stringify(skillGaps)}` : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "behavioral": [
    {
      "question": "behavioral question here",
      "answer": "STAR-formatted answer here",
      "coachingTip": "specific tip for improvement"
    }
  ],
  "technical": [
    {
      "question": "technical question here",
      "answer": "detailed technical answer here",
      "coachingTip": "specific tip for improvement"
    }
  ],
  "weakAreas": ["area 1", "area 2", "area 3"]
}`;

    console.log('Calling Lovable AI for interview question generation...');

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
        temperature: 0.8,
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
        JSON.stringify({ error: 'Failed to generate interview questions' }),
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

    const interviewData = JSON.parse(cleanedContent);

    console.log('Successfully generated interview questions');

    return new Response(
      JSON.stringify({ interviewData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-interview-questions function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
