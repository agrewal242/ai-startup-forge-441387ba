import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// All available travel destinations across continents
const allDestinations = [
  // Europe
  { 
    name: 'Paris', 
    lat: 48.8566, 
    lon: 2.3522, 
    continent: 'Europe',
    highlights: 'Eiffel Tower, Louvre Museum, Notre-Dame',
    bestTime: 'Apr-Jun, Sep-Oct',
    description: 'The City of Light, famous for art, fashion, and cuisine'
  },
  { 
    name: 'London', 
    lat: 51.5074, 
    lon: -0.1278,
    continent: 'Europe',
    highlights: 'Big Ben, British Museum, Tower Bridge',
    bestTime: 'May-Sep',
    description: 'Historic capital blending tradition with modern culture'
  },
  { 
    name: 'Rome', 
    lat: 41.9028, 
    lon: 12.4964,
    continent: 'Europe',
    highlights: 'Colosseum, Vatican City, Trevi Fountain',
    bestTime: 'Apr-Jun, Sep-Oct',
    description: 'The Eternal City, cradle of Western civilization'
  },
  { 
    name: 'Barcelona', 
    lat: 41.3851, 
    lon: 2.1734,
    continent: 'Europe',
    highlights: 'Sagrada Familia, Park Güell, Gothic Quarter',
    bestTime: 'May-Jun, Sep-Oct',
    description: 'Vibrant coastal city with unique Gaudí architecture'
  },
  { 
    name: 'Amsterdam', 
    lat: 52.3676, 
    lon: 4.9041,
    continent: 'Europe',
    highlights: 'Canals, Anne Frank House, Van Gogh Museum',
    bestTime: 'Apr-May, Sep-Nov',
    description: 'Charming canal city known for art and cycling culture'
  },
  
  // Asia
  { 
    name: 'Tokyo', 
    lat: 35.6762, 
    lon: 139.6503,
    continent: 'Asia',
    highlights: 'Senso-ji Temple, Shibuya Crossing, Mount Fuji views',
    bestTime: 'Mar-May, Sep-Nov',
    description: 'Ultra-modern metropolis blending tradition and innovation'
  },
  { 
    name: 'Bangkok', 
    lat: 13.7563, 
    lon: 100.5018,
    continent: 'Asia',
    highlights: 'Grand Palace, Wat Arun, Floating Markets',
    bestTime: 'Nov-Feb',
    description: 'Bustling capital with ornate shrines and vibrant street life'
  },
  { 
    name: 'Singapore', 
    lat: 1.3521, 
    lon: 103.8198,
    continent: 'Asia',
    highlights: 'Marina Bay Sands, Gardens by the Bay, Sentosa',
    bestTime: 'Feb-Apr',
    description: 'Futuristic city-state with world-class attractions'
  },
  { 
    name: 'Dubai', 
    lat: 25.2048, 
    lon: 55.2708,
    continent: 'Asia',
    highlights: 'Burj Khalifa, Palm Jumeirah, Dubai Mall',
    bestTime: 'Nov-Mar',
    description: 'Luxury desert oasis with record-breaking architecture'
  },
  { 
    name: 'Bali', 
    lat: -8.3405, 
    lon: 115.0920,
    continent: 'Asia',
    highlights: 'Ubud Rice Terraces, Uluwatu Temple, Beach Resorts',
    bestTime: 'Apr-Oct',
    description: 'Indonesian paradise island with stunning temples and beaches'
  },
  { 
    name: 'Istanbul', 
    lat: 41.0082, 
    lon: 28.9784,
    continent: 'Asia',
    highlights: 'Hagia Sophia, Blue Mosque, Grand Bazaar',
    bestTime: 'Apr-May, Sep-Nov',
    description: 'Historic crossroads of Europe and Asia'
  },
  
  // North America
  { 
    name: 'New York', 
    lat: 40.7128, 
    lon: -74.0060,
    continent: 'North America',
    highlights: 'Statue of Liberty, Central Park, Times Square',
    bestTime: 'Apr-Jun, Sep-Nov',
    description: 'The city that never sleeps, global cultural hub'
  },
  { 
    name: 'San Francisco', 
    lat: 37.7749, 
    lon: -122.4194,
    continent: 'North America',
    highlights: 'Golden Gate Bridge, Alcatraz, Fisherman\'s Wharf',
    bestTime: 'Sep-Nov',
    description: 'Hilly coastal city known for tech innovation and cable cars'
  },
  { 
    name: 'Cancun', 
    lat: 21.1619, 
    lon: -86.8515,
    continent: 'North America',
    highlights: 'Beaches, Mayan Ruins, Underwater Museum',
    bestTime: 'Dec-Apr',
    description: 'Caribbean paradise with pristine beaches and ancient history'
  },
  { 
    name: 'Vancouver', 
    lat: 49.2827, 
    lon: -123.1207,
    continent: 'North America',
    highlights: 'Stanley Park, Capilano Bridge, Granville Island',
    bestTime: 'Jun-Aug',
    description: 'Stunning coastal city surrounded by mountains'
  },
  
  // South America
  { 
    name: 'Rio de Janeiro', 
    lat: -22.9068, 
    lon: -43.1729,
    continent: 'South America',
    highlights: 'Christ the Redeemer, Copacabana Beach, Sugarloaf Mountain',
    bestTime: 'Dec-Mar',
    description: 'Vibrant Brazilian city famous for beaches and carnival'
  },
  { 
    name: 'Buenos Aires', 
    lat: -34.6037, 
    lon: -58.3816,
    continent: 'South America',
    highlights: 'La Boca, Tango Shows, Recoleta Cemetery',
    bestTime: 'Mar-May, Sep-Nov',
    description: 'Paris of South America with passionate tango culture'
  },
  { 
    name: 'Machu Picchu', 
    lat: -13.1631, 
    lon: -72.5450,
    continent: 'South America',
    highlights: 'Inca Ruins, Sacred Valley, Huayna Picchu',
    bestTime: 'May-Sep',
    description: 'Ancient Incan citadel high in the Andes Mountains'
  },
  
  // Africa
  { 
    name: 'Cape Town', 
    lat: -33.9249, 
    lon: 18.4241,
    continent: 'Africa',
    highlights: 'Table Mountain, V&A Waterfront, Cape of Good Hope',
    bestTime: 'Nov-Mar',
    description: 'Stunning coastal city with dramatic mountain backdrop'
  },
  { 
    name: 'Marrakech', 
    lat: 31.6295, 
    lon: -7.9811,
    continent: 'Africa',
    highlights: 'Jemaa el-Fnaa, Bahia Palace, Souks',
    bestTime: 'Mar-May, Sep-Nov',
    description: 'Magical Moroccan city with vibrant markets and riads'
  },
  { 
    name: 'Cairo', 
    lat: 30.0444, 
    lon: 31.2357,
    continent: 'Africa',
    highlights: 'Pyramids of Giza, Egyptian Museum, Nile River',
    bestTime: 'Oct-Apr',
    description: 'Ancient capital home to the iconic pyramids'
  },
  
  // Oceania
  { 
    name: 'Sydney', 
    lat: -33.8688, 
    lon: 151.2093,
    continent: 'Oceania',
    highlights: 'Opera House, Harbour Bridge, Bondi Beach',
    bestTime: 'Sep-Nov, Mar-May',
    description: 'Iconic harbor city with stunning beaches and landmarks'
  },
  { 
    name: 'Auckland', 
    lat: -36.8485, 
    lon: 174.7633,
    continent: 'Oceania',
    highlights: 'Sky Tower, Waiheke Island, Hobbiton nearby',
    bestTime: 'Dec-Feb',
    description: 'City of Sails with volcanic landscapes and Maori culture'
  },
  { 
    name: 'Fiji', 
    lat: -17.7134, 
    lon: 178.0650,
    continent: 'Oceania',
    highlights: 'Coral Coast, Cloud 9, Traditional Villages',
    bestTime: 'Jul-Sep',
    description: 'Tropical paradise with pristine beaches and coral reefs'
  },
];

// Helper function to shuffle and select random destinations
const getRandomDestinations = (count: number = 15) => {
  const shuffled = [...allDestinations].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const GlobeMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  
  // Randomly select destinations on component mount
  const destinations = useMemo(() => getRandomDestinations(24), []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with world view
    map.current = L.map(mapContainer.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add tile layer - using CartoDB Positron for clean look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map.current);

    // Custom icon for destination markers
    const destinationIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: hsl(var(--primary));
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: hsl(var(--primary) / 0.2);
            border-radius: 50%;
            position: absolute;
            top: -8px;
            left: -8px;
            animation: pulse 2s ease-in-out infinite;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add destination markers with detailed popups
    destinations.forEach((dest) => {
      const marker = L.marker([dest.lat, dest.lon], { icon: destinationIcon })
        .addTo(map.current!);
      
      marker.bindPopup(`
        <div style="padding: 8px; min-width: 250px;">
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 18px; color: hsl(var(--primary));">${dest.name}</strong>
            <div style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: hsl(var(--secondary) / 0.2); border-radius: 4px; font-size: 11px; color: hsl(var(--secondary-foreground));">
              ${dest.continent}
            </div>
          </div>
          
          <p style="margin: 8px 0; font-size: 13px; color: hsl(var(--foreground)); line-height: 1.4;">
            ${dest.description}
          </p>
          
          <div style="margin: 12px 0 8px 0; padding-top: 8px; border-top: 1px solid hsl(var(--border));">
            <div style="margin-bottom: 6px;">
              <strong style="font-size: 12px; color: hsl(var(--muted-foreground));">✨ Highlights:</strong>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: hsl(var(--foreground));">${dest.highlights}</p>
            </div>
            
            <div>
              <strong style="font-size: 12px; color: hsl(var(--muted-foreground));">📅 Best Time:</strong>
              <span style="margin-left: 4px; font-size: 12px; color: hsl(var(--foreground));">${dest.bestTime}</span>
            </div>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'destination-popup'
      });
    });

    // Add CSS animation for pulse effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.5); opacity: 0; }
      }
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .leaflet-popup-tip {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      map.current?.remove();
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg border">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Click markers</span> to explore destinations
          <span className="ml-2 text-xs">• {destinations.length} random picks</span>
        </p>
      </div>
    </div>
  );
};

export default GlobeMap;
