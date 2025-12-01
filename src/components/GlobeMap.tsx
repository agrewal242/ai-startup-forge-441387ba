import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Popular travel destinations
const destinations = [
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

const GlobeMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

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

    // Add destination markers
    destinations.forEach((dest) => {
      const marker = L.marker([dest.lat, dest.lon], { icon: destinationIcon })
        .addTo(map.current!);
      
      marker.bindPopup(`
        <div style="text-align: center; padding: 4px;">
          <strong style="font-size: 16px; color: hsl(var(--primary));">${dest.name}</strong>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: hsl(var(--muted-foreground));">
            Popular destination
          </p>
        </div>
      `);
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
        </p>
      </div>
    </div>
  );
};

export default GlobeMap;
