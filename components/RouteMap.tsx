"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Props {
  pickup?: { latitude: number; longitude: number } | null;
  destination?: { latitude: number; longitude: number } | null;
  routeCoordinates?: [number, number][] | null; // [lng, lat] pairs
}

export default function RouteMap({
  pickup,
  destination,
  routeCoordinates,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      // OpenFreeMap public style — free, no API key, no rate limit.
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [72.8777, 19.076], // default: Mumbai
      zoom: 10,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers + route whenever pickup/destination/route change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    if (pickup) {
      const marker = new maplibregl.Marker({ color: "#16a34a" })
        .setLngLat([pickup.longitude, pickup.latitude])
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([pickup.longitude, pickup.latitude]);
    }

    if (destination) {
      const marker = new maplibregl.Marker({ color: "#dc2626" })
        .setLngLat([destination.longitude, destination.latitude])
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([destination.longitude, destination.latitude]);
    }

    function drawRoute() {
      if (!map || !map.isStyleLoaded()) return;

      if (map.getSource("route")) {
        (map.getSource("route") as maplibregl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates ?? [],
          },
        });
      } else if (routeCoordinates) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: routeCoordinates },
          },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: { "line-color": "#2563eb", "line-width": 4 },
        });
      }
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      if (map.isStyleLoaded()) drawRoute();
      else map.once("load", drawRoute);
      routeCoordinates.forEach((c) => bounds.extend(c as [number, number]));
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [pickup, destination, routeCoordinates]);

  return <div ref={containerRef} className="h-96 w-full rounded-lg" />;
}
