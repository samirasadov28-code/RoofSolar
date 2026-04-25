'use client';

import { useEffect, useRef } from 'react';

// CSS is imported in globals.css via @import to avoid SSR issues with Next.js
export default function MapView({ lat, lon }: { lat: number; lon: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const maplibregl = (await import('maplibre-gl')).default;

      if (destroyed || !containerRef.current) return;

      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [lon, lat],
        zoom: 14,
        attributionControl: false,
      });

      markerRef.current = new maplibregl.Marker({ color: '#FACC15' })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);
    }

    initMap();

    return () => {
      destroyed = true;
      // Only destroy on unmount, not on every coord change
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update position without re-initialising the map
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([lon, lat]);
    markerRef.current?.setLngLat([lon, lat]);
  }, [lat, lon]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
