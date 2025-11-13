import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  contactName: z.string().max(200),
  contactCompany: z.string().max(200).optional(),
  contactRole: z.string().max(200).optional(),
  interactionType: z.enum([
    'initial_outreach',
    'followup',
    'thank_you',
    'coffee_chat_request',
    'referral_request',
    'keep_in_touch'
  ]),
  context: z.string().max(5000).optional(),
  lastInteractionDate: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validatedInput = inputSchema.parse(body);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a professional networking coach helping job seekers build authentic professional relationships. 
Provide practical, actionable networking advice and message templates that feel genuine and not overly sales-y.`;

    const userPrompt = `Generate networking guidance for this situation:

Contact: ${validatedInput.contactName}${validatedInput.contactCompany ? ` at ${validatedInput.contactCompany}` : ''}${validatedInput.contactRole ? ` (${validatedInput.contactRole})` : ''}
Interaction Type: ${validatedInput.interactionType}
${validatedInput.context ? `Context: ${validatedInput.context}` : ''}
${validatedInput.lastInteractionDate ? `Last contacted: ${validatedInput.lastInteractionDate}` : ''}

Provide:
1. A suggested message template (2-4 paragraphs, warm but professional)
2. 3-5 actionable tips for this specific interaction
3. Best timing recommendation`;

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
        tools: [{
          type: 'function',
          function: {
            name: 'provide_networking_guidance',
            description: 'Provide networking tips and message template',
            parameters: {
              type: 'object',
              properties: {
                messageTemplate: {
                  type: 'string',
                  description: 'A warm, professional message template'
                },
                tips: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Actionable networking tips (3-5 items)'
                },
                timing: {
                  type: 'string',
                  description: 'Best time to send this message'
                }
              },
              required: ['messageTemplate', 'tips', 'timing'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { 
          type: 'function', 
          function: { name: 'provide_networking_guidance' } 
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfter ? parseInt(retryAfter) : 60
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI credits depleted. Please add credits to continue.',
            retryAfter: null
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const guidance = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ guidance }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
