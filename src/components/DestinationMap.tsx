import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, ExternalLink } from "lucide-react";
import { POIFilterBar } from "./POIFilterBar";
import { useToast } from "@/hooks/use-toast";

interface POI {
  xid: string;
  name: string;
  lat: number;
  lon: number;
  category: string;
  description: string;
  address: string;
  rating: number;
  image: string;
  wikipedia: string;
  distance: number;
}

interface DestinationMapProps {
  destination: string;
}

const categoryColors: Record<string, string> = {
  cultural: "#9b87f5",
  historic: "#7E69AB",
  nature: "#6E59A5",
  architecture: "#D946EF",
  entertainment: "#F97316",
  other: "#8B5CF6"
};

const categoryIcons: Record<string, string> = {
  cultural: "🏛️",
  historic: "⛪",
  nature: "🌿",
  architecture: "🏗️",
  entertainment: "🎭",
  other: "📍"
};

// Component to recenter map when center changes
const RecenterMap = ({ center }: { center: LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

export const DestinationMap = ({ destination }: DestinationMapProps) => {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default: Paris
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchPOIs();
  }, [destination]);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('get-pois', {
        body: { destination }
      });

      if (error) throw error;

      if (data.pois && data.pois.length > 0) {
        setPois(data.pois);
        setCenter([data.center.lat, data.center.lon]);
        
        // Initialize all categories as active
        const categories = new Set<string>(data.pois.map((poi: POI) => poi.category));
        setActiveCategories(categories);
      } else {
        toast({
          title: "No attractions found",
          description: `We couldn't find any points of interest for ${destination}.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error fetching POIs:", error);
      toast({
        title: "Error loading map",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (category: string) => {
    setActiveCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const filteredPois = pois.filter(poi => activeCategories.has(poi.category));
  const availableCategories = [...new Set(pois.map(poi => poi.category))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Explore {destination}</CardTitle>
          <CardDescription>Discovering nearby attractions...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (pois.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Explore {destination}</CardTitle>
          <CardDescription>No attractions found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Explore {destination}
        </CardTitle>
        <CardDescription>
          {pois.length} attractions nearby • Filter by category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <POIFilterBar
          categories={availableCategories}
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
        />

        <div className="rounded-lg overflow-hidden border" style={{ height: "500px" }}>
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <RecenterMap center={center} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredPois.map((poi) => {
              const icon = new Icon({
                iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="14" fill="${categoryColors[poi.category]}" stroke="white" stroke-width="2"/>
                    <text x="16" y="21" text-anchor="middle" font-size="16">${categoryIcons[poi.category] || "📍"}</text>
                  </svg>
                `)}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
              });

              return (
                <Marker
                  key={poi.xid}
                  position={[poi.lat, poi.lon]}
                  icon={icon}
                >
                  <Popup maxWidth={300}>
                    <div className="space-y-2 p-2">
                      {poi.image && (
                        <img
                          src={poi.image}
                          alt={poi.name}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-base">{poi.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {categoryIcons[poi.category]} {poi.category}
                        </Badge>
                      </div>
                      {poi.address && (
                        <p className="text-sm text-muted-foreground">{poi.address}</p>
                      )}
                      {poi.description && (
                        <p className="text-sm line-clamp-3">{poi.description}</p>
                      )}
                      {poi.distance > 0 && (
                        <p className="text-xs text-muted-foreground">
                          📍 {(poi.distance / 1000).toFixed(1)} km from center
                        </p>
                      )}
                      {poi.wikipedia && (
                        <a
                          href={poi.wikipedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Learn more <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Nearby Places</h3>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {filteredPois.slice(0, 10).map((poi) => (
              <div
                key={poi.xid}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">{categoryIcons[poi.category]}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{poi.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {(poi.distance / 1000).toFixed(1)} km • {poi.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
