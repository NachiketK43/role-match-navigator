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
      jobDescription: z.string().trim().max(50000, 'Job description too long (max 50,000 characters)').optional().nullable()
    });

    const parseResult = inputSchema.safeParse(await req.json());
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetRole, targetCompany, jobDescription } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Role
You are an expert interview coach with 15+ years of experience preparing candidates for technical and non-technical interviews across top global companies. You specialize in crafting targeted interview questions, behavioral prompts, and high-impact answer structures that match the expectations of recruiters and hiring managers.

Task
Your task is to generate 10 tailored interview questions based on the following inputs:
- Target Role
- Target Company
- Job Description (Optional)

If a job description is not provided, infer the required competencies and typical interview patterns based on the role and company.

Each question must include:
- A clearly written, relevant interview question
- A coached sample answer in a recommended format (STAR / SOAR / structured explanation depending on question type)
- A brief explanation of what the interviewer is assessing

Goal
Deliver 10 high-quality interview questions that help the candidate prepare effectively for their upcoming interview.
Questions should reflect:
- The company's culture and expectations
- The role's technical or functional depth
- Behavioral and situational competencies
- Realistic challenges the candidate would face in the role

Output Requirements
1. Ten Tailored Interview Questions
Include a balanced mix of:
- Behavioral questions
- Role-specific technical/functional questions
- Problem-solving or scenario-based questions
- Culture-fit or soft-skill questions

2. Coached Answers
For each question, provide a strong example answer using an appropriate structure:
- STAR – Situation, Task, Action, Result
- SOAR – Situation, Objective, Action, Result
- Structured explanation for technical questions
Answers should demonstrate clarity, confidence, and relevance.

3. What the Interviewer Is Looking For
A short explanation under each question describing the competency being evaluated.

Writing Style Guidelines
- Clear, concise, and candidate-friendly
- Professional but easy to understand
- Role-appropriate vocabulary (technical depth only when needed)
- Answers should reflect strong reasoning and impact
- Include measurable results where possible
- Avoid generic templates — tailor content to the role/company

What NOT to Include
- No overly long paragraphs
- No unrealistic or exaggerated achievements in sample answers
- No company-specific claims that aren't based on known traits
- No answers that sound robotic or copy-paste
- No unnecessary jargon
- No more than 10 questions`;

    const userPrompt = `Generate interview questions and coached answers for:

**TARGET ROLE:**
${targetRole}

**TARGET COMPANY:**
${targetCompany}

**JOB DESCRIPTION:**
${jobDescription || 'Not provided - please infer based on role and company'}

Return ONLY valid JSON (no markdown, no code blocks).`;

    console.log('Calling Lovable AI for interview questions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_interview_questions',
              description: 'Generate 10 tailored interview questions with coached answers and interviewer assessment notes',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string', description: 'The interview question' },
                        answerFormat: { type: 'string', description: 'Recommended answer format (STAR, SOAR, or structured explanation)' },
                        sampleAnswer: { type: 'string', description: 'A coached sample answer demonstrating clarity and impact' },
                        interviewerAssessment: { type: 'string', description: 'What the interviewer is looking for with this question' }
                      },
                      required: ['question', 'answerFormat', 'sampleAnswer', 'interviewerAssessment']
                    },
                    minItems: 10,
                    maxItems: 10
                  },
                  finalNote: {
                    type: 'string',
                    description: 'Personalized tip on how to approach interviews for this role and company'
                  }
                },
                required: ['questions', 'finalNote']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_interview_questions' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || response.headers.get('X-RateLimit-Reset');
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : null;
        
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfterSeconds 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate interview questions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-interview-questions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
