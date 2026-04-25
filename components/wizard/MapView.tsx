'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({ lat, lon }: { lat: number; lon: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [lon, lat],
        zoom: 14,
      });
      markerRef.current = new maplibregl.Marker({ color: '#FACC15' })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);
    } else {
      mapRef.current.setCenter([lon, lat]);
      markerRef.current?.setLngLat([lon, lat]);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lon]);

  return <div ref={containerRef} className="w-full h-full" />;
}
