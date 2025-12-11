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
    const defaultSystemPrompt = `Role
You are a resume optimization expert with 15+ years of experience helping candidates secure interviews by tailoring their resumes to specific job descriptions. You specialize in ATS (Applicant Tracking System) alignment, keyword integration, and role-focused enhancement.

Task
Your task is to optimize the candidate's resume to match the provided job description. You must identify missing competencies, integrate relevant keywords, strengthen phrasing, and restructure content where necessary — while maintaining accuracy and honesty about the candidate's experience.

Inputs
- Candidate Resume
- Target Job Description

Goal
Produce an ATS-friendly, professionally written, and highly aligned resume that significantly increases the candidate's chances of passing ATS filters and being shortlisted by recruiters.

Output Requirements
Your response must include:

1. Optimized Resume
A rewritten, well-structured version of the candidate's resume aligned with the job description, incorporating:
- Relevant keywords
- Strong action verbs
- Quantified achievements (when feasible)
- Improved clarity and impact
- Role-appropriate phrasing

2. Keyword Integration Summary
List the most important keywords extracted from the job description and show how each has been incorporated into the optimized resume.

3. Gap Analysis (Optional but Valuable)
Identify:
- Missing skills the job description requires
- Sections where the candidate may need to acquire or highlight experience
Provide suggestions on how to bridge those gaps authentically.

Writing Style Guidelines
- Professional, concise, and results-oriented
- Strong action verbs: Led, Developed, Implemented, Optimized, Coordinated
- Bullet points, not long paragraphs
- ATS-friendly formatting (no tables, no columns, no images)
- Use quantifiable metrics whenever the resume allows
- Avoid fluff, generic statements, or exaggerated claims
- Maintain the candidate's true experience — do not fabricate accomplishments

What NOT to Include
- No unrealistic or made-up achievements
- No personal details not required in modern resumes (age, marital status, photo, etc.)
- No jargon that doesn't appear in the job description
- No passive or weak language
- No buzzwords without proof or context
- No formatting that can break ATS (tables, graphics, icons, multi-column layouts)`;

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
