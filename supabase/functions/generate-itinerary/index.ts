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

// Amadeus API Integration
const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');
const AMADEUS_TOKEN_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com/v1';

let amadeusAccessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAmadeusToken(): Promise<string> {
  if (amadeusAccessToken && Date.now() < tokenExpiry) {
    return amadeusAccessToken;
  }

  const response = await fetch(AMADEUS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}`,
  });

  if (!response.ok) {
    console.error('Amadeus auth failed:', response.status);
    throw new Error(`Amadeus auth failed: ${response.status}`);
  }

  const data = await response.json();
  amadeusAccessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
  
  if (!amadeusAccessToken) {
    throw new Error('Failed to get Amadeus access token');
  }
  
  return amadeusAccessToken;
}

async function getCityCode(cityName: string): Promise<string | null> {
  try {
    const token = await getAmadeusToken();
    const url = `${AMADEUS_BASE_URL}/reference-data/locations?keyword=${encodeURIComponent(cityName)}&subType=CITY`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Amadeus city search failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.iataCode || null;
  } catch (error) {
    console.error('Error fetching city code:', error);
    return null;
  }
}

async function getFlightOffers(origin: string, destination: string, departureDate: string, adults: number = 1) {
  try {
    const token = await getAmadeusToken();
    const url = `${AMADEUS_BASE_URL}/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&max=5`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Amadeus flight search failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching flight offers:', error);
    return null;
  }
}

async function getHotelOffers(cityCode: string, checkInDate: string, checkOutDate: string) {
  try {
    const token = await getAmadeusToken();
    
    const hotelsUrl = `${AMADEUS_BASE_URL}/reference-data/locations/hotels/by-city?cityCode=${cityCode}`;
    const hotelsResponse = await fetch(hotelsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!hotelsResponse.ok) {
      console.error('Amadeus hotel search failed:', hotelsResponse.status);
      return null;
    }

    const hotelsData = await hotelsResponse.json();
    const hotelIds = hotelsData.data?.slice(0, 5).map((h: any) => h.hotelId).join(',') || '';

    if (!hotelIds) return null;

    const offersUrl = `${AMADEUS_BASE_URL}/shopping/hotel-offers?hotelIds=${hotelIds}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
    const offersResponse = await fetch(offersUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!offersResponse.ok) {
      console.error('Amadeus hotel offers failed:', offersResponse.status);
      return null;
    }

    const offersData = await offersResponse.json();
    return offersData.data || [];
  } catch (error) {
    console.error('Error fetching hotel offers:', error);
    return null;
  }
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

// BRANCH 1: Budget-based Destination Researcher
async function agent2_LuxuryResearcher(trip: TripData, intentAnalysis: string): Promise<string> {
  console.log("🤖 Agent 2 [LUXURY BRANCH]: Premium Destination Researcher");
  
  let realDataContext = '';
  
  if (trip.start_date && trip.end_date) {
    const cityCode = await getCityCode(trip.destination);
    
    if (cityCode) {
      console.log(`Found city code: ${cityCode} for ${trip.destination}`);
      
      const flightOffers = await getFlightOffers('NYC', cityCode, trip.start_date, trip.group_size);
      const hotelOffers = await getHotelOffers(cityCode, trip.start_date, trip.end_date);
      
      if (flightOffers && flightOffers.length > 0) {
        const businessClass = flightOffers.filter((f: any) => 
          f.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin === 'BUSINESS'
        );
        const prices = (businessClass.length > 0 ? businessClass : flightOffers)
          .slice(0, 3)
          .map((f: any) => `${f.price?.total} ${f.price?.currency}`);
        realDataContext += `\n\n✈️ PREMIUM FLIGHT OPTIONS (Amadeus):\n- Business/First class from NYC: ${prices.join(', ')}\n- ${flightOffers.length} flight options available`;
      }
      
      if (hotelOffers && hotelOffers.length > 0) {
        const sortedHotels = hotelOffers.sort((a: any, b: any) => {
          const priceA = parseFloat(a.offers?.[0]?.price?.total || '0');
          const priceB = parseFloat(b.offers?.[0]?.price?.total || '0');
          return priceB - priceA; // Highest price first
        });
        
        const hotelPrices = sortedHotels
          .slice(0, 3)
          .map((h: any) => h.offers?.[0]?.price?.total)
          .filter((p: any) => p)
          .map((p: any) => `${p} ${hotelOffers[0].offers?.[0]?.price?.currency}`);
        
        realDataContext += `\n\n🏨 LUXURY HOTEL OPTIONS (Amadeus):\n- Premium properties: ${hotelPrices.join(', ')}/night\n- 5-star and boutique hotels prioritized`;
      }
    }
  }
  
  const prompt = `Research ${trip.destination} for a LUXURY travel experience:

${intentAnalysis}

Budget: HIGH - Luxury tier
Travel Style: ${trip.travel_style}
${realDataContext}

Provide PREMIUM-focused information:
1. Top 5 exclusive/luxury locations in ${trip.destination} (Michelin restaurants, 5-star hotels, VIP experiences)
2. Private transportation options (chauffeur services, helicopter transfers, yacht charters)
3. Exclusive access opportunities (private museum tours, celebrity chef experiences, member's clubs)
4. Concierge services and luxury amenities
5. High-end shopping and dining districts

Keep response focused on premium experiences (300 words max).`;

  const systemPrompt = "You are a luxury travel concierge with access to premium pricing data. Focus exclusively on high-end experiences, five-star properties, and VIP services.";
  
  return await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
}

async function agent2_StandardResearcher(trip: TripData, intentAnalysis: string): Promise<string> {
  console.log("🤖 Agent 2 [STANDARD BRANCH]: Value-focused Destination Researcher");
  
  let realDataContext = '';
  
  if (trip.start_date && trip.end_date) {
    const cityCode = await getCityCode(trip.destination);
    
    if (cityCode) {
      console.log(`Found city code: ${cityCode} for ${trip.destination}`);
      
      const flightOffers = await getFlightOffers('NYC', cityCode, trip.start_date, trip.group_size);
      const hotelOffers = await getHotelOffers(cityCode, trip.start_date, trip.end_date);
      
      if (flightOffers && flightOffers.length > 0) {
        const economyFlights = flightOffers.sort((a: any, b: any) => 
          parseFloat(a.price?.total || '9999') - parseFloat(b.price?.total || '9999')
        );
        const prices = economyFlights.slice(0, 3).map((f: any) => `${f.price?.total} ${f.price?.currency}`);
        realDataContext += `\n\n📊 BEST VALUE FLIGHTS (Amadeus):\n- Economy prices from NYC: ${prices.join(', ')}\n- ${flightOffers.length} options available`;
      }
      
      if (hotelOffers && hotelOffers.length > 0) {
        const affordableHotels = hotelOffers.sort((a: any, b: any) => {
          const priceA = parseFloat(a.offers?.[0]?.price?.total || '9999');
          const priceB = parseFloat(b.offers?.[0]?.price?.total || '9999');
          return priceA - priceB; // Lowest price first
        });
        
        const hotelPrices = affordableHotels
          .slice(0, 3)
          .map((h: any) => h.offers?.[0]?.price?.total)
          .filter((p: any) => p)
          .map((p: any) => `${p} ${hotelOffers[0].offers?.[0]?.price?.currency}`);
        
        realDataContext += `\n\n🏨 BEST VALUE HOTELS (Amadeus):\n- Budget-friendly rates: ${hotelPrices.join(', ')}/night\n- ${hotelOffers.length} properties with good reviews`;
      }
    }
  }
  
  const prompt = `Research ${trip.destination} for VALUE-FOCUSED travel:

${intentAnalysis}

Budget: ${trip.budget_tier === 'low' ? 'LOW' : 'MEDIUM'} - Value-conscious
Travel Style: ${trip.travel_style}
${realDataContext}

Provide BUDGET-SMART information:
1. Top 3-5 must-see attractions (including FREE options)
2. Public transportation tips and multi-day passes
3. Budget accommodation areas (safe neighborhoods with good transit access)
4. Local markets, affordable eateries, street food recommendations
5. Money-saving tips and discount cards

Keep response focused on maximizing value (300 words max).`;

  const systemPrompt = "You are a savvy budget travel expert with access to real pricing data. Focus on value, free activities, and cost-saving strategies without compromising experience quality.";
  
  return await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
}

// BRANCH 2: Travel Style-based Activity Curator
async function agent3_ActiveCurator(trip: TripData, intentAnalysis: string, destinationResearch: string): Promise<string> {
  console.log("🤖 Agent 3 [ACTIVE BRANCH]: Adventure & Cultural Activity Curator");

  let hotelRecommendations = '';
  
  if (trip.start_date && trip.end_date) {
    const cityCode = await getCityCode(trip.destination);
    
    if (cityCode) {
      const hotelOffers = await getHotelOffers(cityCode, trip.start_date, trip.end_date);
      
      if (hotelOffers && hotelOffers.length > 0) {
        hotelRecommendations = '\n\n🏨 ACTIVE-TRAVELER HOTELS (Amadeus):\n';
        hotelOffers.slice(0, 5).forEach((hotel: any, idx: number) => {
          const offer = hotel.offers?.[0];
          if (offer) {
            hotelRecommendations += `${idx + 1}. ${hotel.hotel?.name || 'Hotel'} - ${offer.price?.total} ${offer.price?.currency}/night (close to activities)\n`;
          }
        });
      }
    }
  }

  const styleGuidance = trip.travel_style === 'adventure'
    ? "ADVENTURE FOCUS: Outdoor activities, hiking trails, water sports (kayaking, surfing, diving), rock climbing, zip-lining, bike tours, extreme sports, wildlife encounters."
    : "CULTURAL FOCUS: Museums, art galleries, historical sites, UNESCO heritage locations, local markets, cooking classes, cultural performances, architecture tours, artisan workshops.";

  const prompt = `Curate ACTIVE experiences for ${trip.destination}:

${styleGuidance}

Budget: ${trip.budget_tier}
Group Size: ${trip.group_size} people

Destination Research:
${destinationResearch}
${hotelRecommendations}

Provide 10-15 ACTIVE activities:
1. Physical activities & outdoor adventures (hiking, biking, water sports)
2. Cultural immersion experiences (tours, classes, workshops)
3. Morning activities (sunrise hikes, early market visits)
4. Full-day excursions
5. Estimated costs, duration, fitness level required
6. Booking requirements and best seasons
7. Group discounts available

Focus on ACTIVE, ENGAGING experiences. Max 400 words.`;

  const systemPrompt = "You are an adventure and cultural travel expert. Prioritize physically engaging and intellectually stimulating experiences. Include practical logistics and fitness requirements.";
  
  return await callLovableAI([{ role: "user", content: prompt }], systemPrompt);
}

async function agent3_LeisureCurator(trip: TripData, intentAnalysis: string, destinationResearch: string): Promise<string> {
  console.log("🤖 Agent 3 [LEISURE BRANCH]: Relaxation & Nightlife Activity Curator");

  let hotelRecommendations = '';
  
  if (trip.start_date && trip.end_date) {
    const cityCode = await getCityCode(trip.destination);
    
    if (cityCode) {
      const hotelOffers = await getHotelOffers(cityCode, trip.start_date, trip.end_date);
      
      if (hotelOffers && hotelOffers.length > 0) {
        hotelRecommendations = '\n\n🏨 LEISURE-FOCUSED HOTELS (Amadeus):\n';
        hotelOffers.slice(0, 5).forEach((hotel: any, idx: number) => {
          const offer = hotel.offers?.[0];
          if (offer) {
            hotelRecommendations += `${idx + 1}. ${hotel.hotel?.name || 'Hotel'} - ${offer.price?.total} ${offer.price?.currency}/night (spa/beach access)\n`;
          }
        });
      }
    }
  }

  const styleGuidance = trip.travel_style === 'relaxation'
    ? "RELAXATION FOCUS: Spa treatments, beach clubs, scenic viewpoints, sunset cruises, yoga retreats, thermal baths, meditation spots, leisurely garden walks, wine tastings."
    : "NIGHTLIFE FOCUS: Rooftop bars, nightclubs, live music venues, jazz clubs, cocktail bars, late-night restaurants, sunset lounges, pub crawls, entertainment districts.";

  const prompt = `Curate LEISURE experiences for ${trip.destination}:

${styleGuidance}

Budget: ${trip.budget_tier}
Group Size: ${trip.group_size} people

Destination Research:
${destinationResearch}
${hotelRecommendations}

Provide 10-15 RELAXING/NIGHTLIFE activities:
1. Spa & wellness experiences (massage, hot springs, wellness centers)
2. Beach clubs & pool lounges
3. Sunset viewing spots & romantic locations
4. Evening entertainment (bars, clubs, live music)
5. Late-night dining recommendations
6. Low-intensity daytime activities
7. Estimated costs, duration, dress codes
8. Reservations needed and peak hours

Focus on COMFORT and ENTERTAINMENT. Max 400 words.`;

  const systemPrompt = "You are a relaxation and nightlife travel expert. Prioritize comfort, low physical exertion, and evening entertainment. Include ambiance descriptions and booking tips.";
  
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
    
    // Validate tripId format
    if (!tripId) {
      throw new Error("Trip ID is required");
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tripId)) {
      throw new Error("Invalid trip ID format");
    }

    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    console.log(`Starting AI workflow for trip: ${tripId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user owns the trip
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    // Fetch trip details
    const { data: trip, error: fetchError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (fetchError || !trip) {
      throw new Error("Trip not found");
    }

    // Verify ownership
    if (trip.user_id !== user.id) {
      throw new Error("Unauthorized: You don't own this trip");
    }

    // Agent 1: Intent Analyzer
    await updateTripStatus(supabase, tripId, "analyzing_intent");
    const intentAnalysis = await agent1_IntentAnalyzer(trip);
    console.log("Intent analysis complete");

    // Agent 2: Destination Researcher (CONDITIONAL BRANCH 1 - Budget-based)
    await updateTripStatus(supabase, tripId, "researching_destination");
    let destinationResearch: string;
    
    if (trip.budget_tier === 'high') {
      console.log("🔀 BRANCH 1: Using Luxury Researcher (high budget)");
      destinationResearch = await agent2_LuxuryResearcher(trip, intentAnalysis);
    } else {
      console.log("🔀 BRANCH 1: Using Standard Researcher (low/medium budget)");
      destinationResearch = await agent2_StandardResearcher(trip, intentAnalysis);
    }
    console.log("Destination research complete");

    // Agent 3: Activity Curator (CONDITIONAL BRANCH 2 - Travel Style-based)
    await updateTripStatus(supabase, tripId, "curating_activities");
    let curatedActivities: string;
    
    if (trip.travel_style === 'adventure' || trip.travel_style === 'cultural') {
      console.log("🔀 BRANCH 2: Using Active Curator (adventure/cultural)");
      curatedActivities = await agent3_ActiveCurator(trip, intentAnalysis, destinationResearch);
    } else {
      console.log("🔀 BRANCH 2: Using Leisure Curator (relaxation/nightlife)");
      curatedActivities = await agent3_LeisureCurator(trip, intentAnalysis, destinationResearch);
    }
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
