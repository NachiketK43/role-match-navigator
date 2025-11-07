import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { resume, jobDescription } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing skill gap with Lovable AI...");

    const systemPrompt = `You are a senior career analyst and technical recruiter with 15+ years of experience. Your role is to analyze resume-to-job fit with precision and confidence.

Analyze the provided resume against the job description and return a structured JSON assessment.

Your analysis should be:
- Data-driven and objective
- Confident but realistic
- Actionable and specific
- Professional in tone

Return ONLY valid JSON with this exact structure:
{
  "matchScore": number (0-100),
  "strengths": [string array of 4-6 specific strengths they possess],
  "gaps": [
    {
      "skill": "skill name",
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendations": [
    {
      "title": "concise actionable title",
      "description": "specific project or learning path (one sentence)",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Guidelines:
- matchScore should reflect realistic fit (60-85% is typical for good candidates)
- Strengths should be specific achievements/skills they clearly demonstrate
- Identify 3-5 gaps that would make the biggest impact
- Provide 3-5 actionable recommendations with concrete projects/courses
- Use "high" priority sparingly (only for truly critical missing skills)`;

    const userPrompt = `RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Analyze this candidate's fit for this role and provide structured guidance.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw AI response:", aiContent);

    // Extract JSON from potential markdown code blocks
    let analysisData;
    try {
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      analysisData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, aiContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the structure
    if (
      typeof analysisData.matchScore !== "number" ||
      !Array.isArray(analysisData.strengths) ||
      !Array.isArray(analysisData.gaps) ||
      !Array.isArray(analysisData.recommendations)
    ) {
      console.error("Invalid analysis structure:", analysisData);
      return new Response(
        JSON.stringify({ error: "Invalid analysis format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis successful, match score:", analysisData.matchScore);

    return new Response(
      JSON.stringify({ analysis: analysisData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-skill-gap function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
