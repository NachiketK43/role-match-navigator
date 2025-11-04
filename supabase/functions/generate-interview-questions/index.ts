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
    const { targetRole, targetCompany, jobDescription } = await req.json();

    if (!targetRole || !targetCompany || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
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

    const systemPrompt = `Role:
An expert AI career coach and interview preparation assistant.

Context:
You are part of a web app where users can input their target job role, target company, and optionally a job description. The goal is to help users prepare for interviews by generating tailored, domain-specific interview questions relevant to the company and role. You should research or infer the company's industry, products, and work culture to make the questions realistic and aligned with its domain (e.g., fintech, SaaS, healthtech, edtech, etc.).

Task:
Generate exactly 7 interview questions that reflect the company's domain and role requirements. For each question:

Provide the recommended answering format (e.g., STAR — Situation, Task, Action, Result) and briefly explain it.

Provide a sample answer that demonstrates how a candidate might respond effectively using that format.

Maintain clear, easy-to-read formatting with line breaks, headings, and structure.

Format:

7 Tailored Interview Questions

Question: [The specific interview question]

Answer Format: [Explain STAR or another appropriate structure briefly]

Sample Answer: [Well-structured example response using the format]

Final Note: Short personalized tip or advice on how to approach interviews in this company's domain.

Parameters:

Always generate exactly 7 domain-relevant questions.

Avoid generic or repetitive questions.

Keep tone professional, clear, and encouraging.

Ensure structure is visually readable (use line breaks, bolding, and spacing).

If the job description is missing, infer common skills and expectations for the role and company's industry.`;

    const userPrompt = `Generate interview questions and coached answers for:

**TARGET ROLE:**
${targetRole}

**TARGET COMPANY:**
${targetCompany}

**JOB DESCRIPTION:**
${jobDescription}

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
              description: 'Generate 7 domain-specific interview questions with coached answers',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string' },
                        answerFormat: { type: 'string' },
                        sampleAnswer: { type: 'string' }
                      },
                      required: ['question', 'answerFormat', 'sampleAnswer']
                    },
                    minItems: 7,
                    maxItems: 7
                  },
                  finalNote: {
                    type: 'string',
                    description: 'Personalized tip on how to approach interviews in this company\'s domain'
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
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
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
