import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GlobeMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !tokenEntered || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe' as any,
        zoom: 1.5,
        center: [30, 15],
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Disable scroll zoom for smoother experience
      map.current.scrollZoom.disable();

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });
      });

      // Rotation animation settings
      const secondsPerRevolution = 240;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;
      let userInteracting = false;
      let spinEnabled = true;

      // Spin globe function
      function spinGlobe() {
        if (!map.current) return;
        
        const zoom = map.current.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      // Event listeners for interaction
      map.current.on('mousedown', () => {
        userInteracting = true;
      });
      
      map.current.on('dragstart', () => {
        userInteracting = true;
      });
      
      map.current.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
      });
      
      map.current.on('touchend', () => {
        userInteracting = false;
        spinGlobe();
      });

      map.current.on('moveend', () => {
        spinGlobe();
      });

      // Start the globe spinning
      spinGlobe();
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [tokenEntered, mapboxToken]);

  if (!tokenEntered) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Enter Mapbox Token</CardTitle>
          <CardDescription>
            Get your free public token from{' '}
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbHN4eXoifQ..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <button
            onClick={() => setTokenEntered(true)}
            disabled={!mapboxToken}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load Map
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};

export default GlobeMap;
