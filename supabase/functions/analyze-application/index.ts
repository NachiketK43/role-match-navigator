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
      companyName: z.string().trim().min(1, 'Company name is required').max(200, 'Company name too long'),
      jobTitle: z.string().trim().min(1, 'Job title is required').max(200, 'Job title too long'),
      jobDescription: z.string().trim().max(50000, 'Job description too long (max 50,000 characters)').optional().nullable(),
      currentStatus: z.enum(['wishlist', 'applied', 'screening', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn']),
      appliedDate: z.string().optional().nullable(),
      lastActivity: z.string().trim().max(1000, 'Last activity too long').optional().nullable()
    });

    const parseResult = inputSchema.safeParse(await req.json());
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { companyName, jobTitle, jobDescription, currentStatus, appliedDate, lastActivity } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert career coach specializing in job application strategy and follow-up timing. 
Analyze job application data and provide actionable insights.`;

    const userPrompt = `Analyze this job application:

Company: ${companyName}
Role: ${jobTitle}
Current Status: ${currentStatus}
Applied Date: ${appliedDate || 'Not yet applied'}
Last Activity: ${lastActivity || 'None'}
Job Description: ${jobDescription || 'Not provided'}

Provide insights in the following areas:
1. Next recommended action
2. Follow-up timing (if applicable)
3. Key preparation points for next stage
4. Red flags or concerns (if any)
5. Estimated timeline for this stage`;

    console.log('Calling Lovable AI for application insights...');

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
              name: 'provide_application_insights',
              description: 'Provide actionable insights for a job application',
              parameters: {
                type: 'object',
                properties: {
                  nextAction: {
                    type: 'string',
                    description: 'The recommended next action to take'
                  },
                  followUpTiming: {
                    type: 'string',
                    description: 'When and how to follow up'
                  },
                  preparationPoints: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Key points to prepare for next stage'
                  },
                  concerns: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Any red flags or concerns'
                  },
                  estimatedTimeline: {
                    type: 'string',
                    description: 'Expected timeline for current stage'
                  }
                },
                required: ['nextAction', 'followUpTiming', 'preparationPoints', 'estimatedTimeline']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_application_insights' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate insights' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const insights = JSON.parse(toolCall.function.arguments);

    console.log('Successfully generated application insights');

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-application:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
