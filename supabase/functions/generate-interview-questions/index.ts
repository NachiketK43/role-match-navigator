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
    const { resume, jobDescription } = await req.json();

    if (!resume || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume and job description are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert career coach specializing in interview preparation. Your task is to:
1. Analyze the candidate's resume and the target job description
2. Generate 8-12 highly relevant interview questions (split between behavioral and technical)
3. Provide STAR method answers tailored to the candidate's background
4. Identify 2-3 weak areas or skill gaps to focus on

Return a JSON object with this exact structure:
{
  "behavioral": [
    {
      "question": "string",
      "answer": "string (using STAR: Situation, Task, Action, Result format)",
      "coachingTip": "string (one actionable tip)"
    }
  ],
  "technical": [
    {
      "question": "string",
      "answer": "string (specific to their experience)",
      "coachingTip": "string (one actionable tip)"
    }
  ],
  "weakAreas": ["string", "string", "string"]
}`;

    const userPrompt = `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nGenerate interview questions and STAR method answers.`;

    console.log("Calling Lovable AI for interview questions...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_interview_questions",
              description: "Generate interview questions with STAR method answers",
              parameters: {
                type: "object",
                properties: {
                  behavioral: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                        coachingTip: { type: "string" }
                      },
                      required: ["question", "answer", "coachingTip"]
                    }
                  },
                  technical: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                        coachingTip: { type: "string" }
                      },
                      required: ["question", "answer", "coachingTip"]
                    }
                  },
                  weakAreas: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["behavioral", "technical", "weakAreas"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_interview_questions" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate interview questions" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("Lovable AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-interview-questions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
