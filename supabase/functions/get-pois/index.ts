import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface POI {
  name: string;
  lat: number;
  lon: number;
  category: string;
  kinds: string;
  xid: string;
  distance?: number;
}

interface POIDetails {
  xid: string;
  name: string;
  address?: {
    city?: string;
    road?: string;
    house_number?: string;
  };
  rate?: number;
  kinds?: string;
  point?: {
    lat: number;
    lon: number;
  };
  wikipedia?: string;
  wikipedia_extracts?: {
    text?: string;
  };
  preview?: {
    source?: string;
  };
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination } = await req.json();
    
    if (!destination) {
      throw new Error('Destination is required');
    }

    const apiKey = Deno.env.get('OPENTRIPMAP_API_KEY');
    if (!apiKey) {
      throw new Error('OpenTripMap API key not configured');
    }

    console.log(`Fetching POIs for: ${destination}`);

    // Step 1: Geocode the destination
    const geonameUrl = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(destination)}&apikey=${apiKey}`;
    const geonameResponse = await fetch(geonameUrl);
    
    if (!geonameResponse.ok) {
      console.warn(`Geocoding failed for ${destination}: ${geonameResponse.status} ${geonameResponse.statusText}`);
      return new Response(
        JSON.stringify({
          destination,
          center: null,
          pois: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geoData = await geonameResponse.json();
    const { lat, lon } = geoData;

    if (!lat || !lon) {
      console.warn('Could not find coordinates for destination', destination, geoData);
      return new Response(
        JSON.stringify({
          destination,
          center: null,
          pois: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Coordinates found: ${lat}, ${lon}`);

    // Step 2: Fetch POIs in radius (10km)
    const radius = 10000; // 10km in meters
    const radiusUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=cultural,historic,architecture,interesting_places,natural,museums,churches,theatres&limit=50&apikey=${apiKey}`;
    
    const radiusResponse = await fetch(radiusUrl);
    
    if (!radiusResponse.ok) {
      throw new Error(`POI fetch failed: ${radiusResponse.statusText}`);
    }

    const pois: POI[] = await radiusResponse.json();
    console.log(`Found ${pois.length} POIs`);

    // Step 3: Get detailed info for top 20 POIs (to avoid rate limits)
    const topPois = pois.slice(0, 20);
    const detailedPois = await Promise.all(
      topPois.map(async (poi) => {
        try {
          const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${poi.xid}?apikey=${apiKey}`;
          const detailResponse = await fetch(detailUrl);
          
          if (!detailResponse.ok) {
            console.warn(`Failed to fetch details for ${poi.xid}`);
            return null;
          }

          const details: POIDetails = await detailResponse.json();
          
          // Categorize POIs
          let category = 'other';
          const kinds = details.kinds?.toLowerCase() || '';
          
          if (kinds.includes('museum') || kinds.includes('cultural')) {
            category = 'cultural';
          } else if (kinds.includes('church') || kinds.includes('religion') || kinds.includes('historic')) {
            category = 'historic';
          } else if (kinds.includes('nature') || kinds.includes('park') || kinds.includes('beach')) {
            category = 'nature';
          } else if (kinds.includes('architecture') || kinds.includes('tower') || kinds.includes('bridge')) {
            category = 'architecture';
          } else if (kinds.includes('theatre') || kinds.includes('entertainment')) {
            category = 'entertainment';
          }

          return {
            xid: details.xid,
            name: details.name || poi.name,
            lat: details.point?.lat || poi.lat,
            lon: details.point?.lon || poi.lon,
            category,
            kinds: details.kinds || poi.kinds,
            description: details.wikipedia_extracts?.text || '',
            address: details.address ? 
              [details.address.road, details.address.house_number, details.address.city]
                .filter(Boolean)
                .join(', ') : '',
            rating: details.rate || 0,
            image: details.preview?.source || '',
            wikipedia: details.wikipedia || '',
            url: details.url || '',
            distance: poi.distance || 0
          };
        } catch (error) {
          console.error(`Error fetching details for POI ${poi.xid}:`, error);
          return null;
        }
      })
    );

    // Filter out failed requests
    const validPois = detailedPois.filter(poi => poi !== null);

    console.log(`Returning ${validPois.length} detailed POIs`);

    return new Response(
      JSON.stringify({
        destination,
        center: { lat, lon },
        pois: validPois
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in get-pois function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
