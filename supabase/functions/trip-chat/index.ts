import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tripContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are SmartTrip AI Assistant, a helpful travel support chatbot. Your role is to:

1. **Help users with their existing trips**: Answer questions about their itineraries, suggest modifications, provide tips for their destinations.

2. **Provide destination expertise**: Share local insights, best times to visit attractions, transportation tips, and cultural advice.

3. **Assist with trip planning**: Help users think through their travel plans, suggest activities based on their preferences, and provide practical advice.

${tripContext ? `
**Current Trip Context:**
- Destination: ${tripContext.destination}
- Dates: ${tripContext.startDate || 'Not set'} to ${tripContext.endDate || 'Not set'}
- Travel Style: ${tripContext.travelStyle || 'Not specified'}
- Budget: ${tripContext.budgetTier || 'Not specified'}
- Group Size: ${tripContext.groupSize || 'Not specified'}

Use this context to provide personalized, relevant assistance.
` : 'No specific trip context provided - help with general travel questions.'}

**Guidelines:**
- Be concise but helpful (2-4 sentences typically)
- Provide actionable advice
- Be enthusiastic about travel
- If you don't know something specific, suggest resources or alternatives
- Use emojis sparingly for friendliness`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Trip chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
