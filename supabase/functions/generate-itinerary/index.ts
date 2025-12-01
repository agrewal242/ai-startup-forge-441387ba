import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TripData {
  id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget_tier: string;
  travel_style: string;
  group_size: number;
}

async function callLovableAI(messages: any[], systemPrompt: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
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
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function updateTripStatus(supabase: any, tripId: string, status: string, itinerary?: any) {
  const updateData: any = { status };
  if (itinerary) {
    updateData.itinerary = itinerary;
  }
  
  const { error } = await supabase
    .from("trips")
    .update(updateData)
    .eq("id", tripId);

  if (error) {
    console.error("Error updating trip status:", error);
    throw error;
  }
  
  console.log(`Trip ${tripId} status updated to: ${status}`);
}

async function agent1_IntentAnalyzer(trip: TripData): Promise<string> {
  console.log("🤖 Agent 1: Intent Analyzer - Starting analysis");
  
  const prompt = `Analyze this travel request and extract key intent:
  
Destination: ${trip.destination}
Dates: ${trip.start_date || 'Flexible'} to ${trip.end_date || 'Flexible'}
Budget: ${trip.budget_tier}
Travel Style: ${trip.travel_style}
Group Size: ${trip.group_size}

Provide a concise analysis of:
1. Primary travel motivations
2. Key priorities based on budget and style
3. Recommended trip duration (if dates not specified)
4. Special considerations for group size

Keep response under 200 words.`;

  const systemPrompt = "You are an expert travel intent analyzer. Extract key insights from traveler preferences to guide trip planning.";
  
  return await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
}

async function agent2_DestinationResearcher(trip: TripData, intentAnalysis: string): Promise<string> {
  console.log("🤖 Agent 2: Destination Researcher - Researching destination");
  
  const prompt = `Research ${trip.destination} for this trip profile:

${intentAnalysis}

Budget: ${trip.budget_tier}
Travel Style: ${trip.travel_style}

Provide:
1. Top 3-5 must-visit locations/districts in ${trip.destination}
2. Best time considerations (if dates are flexible)
3. Budget-specific tips for ${trip.budget_tier} tier
4. Cultural insights and local customs
5. Transportation recommendations

Keep response focused and actionable (300 words max).`;

  const systemPrompt = "You are an expert destination researcher with deep knowledge of global travel destinations. Provide practical, insider information.";
  
  return await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
}

async function agent3_ActivityCurator(trip: TripData, intentAnalysis: string, destinationResearch: string): Promise<string> {
  console.log("🤖 Agent 3: Activity Curator - Curating activities");
  
  // Conditional branching based on travel_style and budget_tier
  let styleGuidance = "";
  
  switch (trip.travel_style) {
    case "adventure":
      styleGuidance = "Focus on outdoor activities, hiking, water sports, adventure tours, and physically engaging experiences.";
      break;
    case "relaxation":
      styleGuidance = "Prioritize spas, beaches, scenic views, leisurely walks, and low-intensity activities.";
      break;
    case "cultural":
      styleGuidance = "Emphasize museums, historical sites, local markets, cultural performances, and heritage experiences.";
      break;
    case "nightlife":
      styleGuidance = "Highlight bars, clubs, live music venues, evening entertainment, and late-night dining.";
      break;
  }
  
  let budgetGuidance = "";
  switch (trip.budget_tier) {
    case "low":
      budgetGuidance = "Focus on free/low-cost activities, street food, public transport, budget-friendly alternatives.";
      break;
    case "medium":
      budgetGuidance = "Balance between popular paid attractions and affordable options. Mid-range dining and activities.";
      break;
    case "high":
      budgetGuidance = "Include premium experiences, fine dining, private tours, luxury services, and exclusive access.";
      break;
  }

  const prompt = `Curate specific activities for ${trip.destination}:

Travel Style: ${trip.travel_style}
${styleGuidance}

Budget: ${trip.budget_tier}
${budgetGuidance}

Group Size: ${trip.group_size} people

Destination Research:
${destinationResearch}

Provide:
1. 8-12 specific activities/experiences matched to the travel style
2. Estimated costs per activity (in USD)
3. Time requirements for each
4. Best times of day for each activity
5. Group-friendly considerations

Format as a curated list with details. Max 400 words.`;

  const systemPrompt = "You are an expert activity curator who creates personalized travel experiences. Match activities precisely to traveler preferences and constraints.";
  
  return await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
}

async function agent4_ItineraryGenerator(trip: TripData, intentAnalysis: string, destinationResearch: string, curatedActivities: string): Promise<any> {
  console.log("🤖 Agent 4: Itinerary Generator - Creating final itinerary");
  
  const tripDuration = trip.start_date && trip.end_date 
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 5; // Default 5 days if dates not specified

  const prompt = `Generate a detailed day-by-day itinerary for ${trip.destination}:

Trip Duration: ${tripDuration} days
Budget: ${trip.budget_tier}
Travel Style: ${trip.travel_style}
Group Size: ${trip.group_size}

Intent Analysis:
${intentAnalysis}

Destination Research:
${destinationResearch}

Curated Activities:
${curatedActivities}

Create a structured itinerary with:
1. Daily schedule with morning/afternoon/evening activities
2. Specific timings and locations
3. Transportation between locations
4. Meal recommendations
5. Daily budget estimates
6. Pro tips for each day

Format as JSON with this structure:
{
  "summary": "Brief overview",
  "total_estimated_cost": "USD amount",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "location": "Specific location",
          "duration": "2 hours",
          "cost": "$50",
          "notes": "Tips and details"
        }
      ]
    }
  ],
  "tips": ["Overall trip tips"]
}`;

  const systemPrompt = "You are an expert itinerary generator. Create detailed, realistic, and well-paced travel itineraries. Always respond with valid JSON only, no additional text.";
  
  const response = await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
  
  // Parse JSON from response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch (error) {
    console.error("Error parsing itinerary JSON:", error);
    // Return structured fallback
    return {
      summary: response.substring(0, 200),
      raw_itinerary: response,
      error: "Could not parse structured itinerary"
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripId } = await req.json();
    
    if (!tripId) {
      throw new Error("Trip ID is required");
    }

    console.log(`Starting AI workflow for trip: ${tripId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch trip details
    const { data: trip, error: fetchError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (fetchError || !trip) {
      throw new Error("Trip not found");
    }

    // Agent 1: Intent Analyzer
    await updateTripStatus(supabase, tripId, "analyzing_intent");
    const intentAnalysis = await agent1_IntentAnalyzer(trip);
    console.log("Intent analysis complete");

    // Agent 2: Destination Researcher
    await updateTripStatus(supabase, tripId, "researching_destination");
    const destinationResearch = await agent2_DestinationResearcher(trip, intentAnalysis);
    console.log("Destination research complete");

    // Agent 3: Activity Curator (with conditional branching)
    await updateTripStatus(supabase, tripId, "curating_activities");
    const curatedActivities = await agent3_ActivityCurator(trip, intentAnalysis, destinationResearch);
    console.log("Activity curation complete");

    // Agent 4: Itinerary Generator
    await updateTripStatus(supabase, tripId, "generating_itinerary");
    const finalItinerary = await agent4_ItineraryGenerator(trip, intentAnalysis, destinationResearch, curatedActivities);
    console.log("Itinerary generation complete");

    // Save final itinerary and mark as complete
    await updateTripStatus(supabase, tripId, "completed", finalItinerary);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Itinerary generated successfully",
        itinerary: finalItinerary 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in generate-itinerary function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while generating the itinerary" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
