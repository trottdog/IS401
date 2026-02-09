import React, { useRef, useEffect, useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  label: string;
}

interface MapViewWrapperProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers: MapMarker[];
  onMarkerPress: (id: string) => void;
  mapRef?: any;
}

function getMapHTML(markers: MapMarker[], center: { lat: number; lng: number }, zoom: number, apiKey: string, styleUrl: string): string {
  const markersJSON = JSON.stringify(markers);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link href="https://cdn.maptiler.com/maplibre-gl-js/v4.7.1/maplibre-gl.css" rel="stylesheet" />
<script src="https://cdn.maptiler.com/maplibre-gl-js/v4.7.1/maplibre-gl.js"></script>
<style>
  body { margin: 0; padding: 0; }
  #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  .marker-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    gap: 2px;
  }
  .marker-badge {
    width: 34px;
    height: 34px;
    border-radius: 17px;
    background: #002E5D;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    border: 2px solid white;
    transition: transform 0.15s ease;
  }
  .marker-badge:hover {
    transform: scale(1.15);
  }
  .marker-label {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #002E5D;
    background: rgba(255,255,255,0.92);
    padding: 1px 5px;
    border-radius: 4px;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
  const markers = ${markersJSON};

  const map = new maplibregl.Map({
    container: 'map',
    style: '${styleUrl}',
    center: [${center.lng}, ${center.lat}],
    zoom: ${zoom},
    pitch: 0,
    attributionControl: false
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  map.on('load', function() {
    markers.forEach(function(m) {
      const el = document.createElement('div');
      el.className = 'marker-container';
      el.innerHTML = '<div class="marker-badge">' + m.count + '</div><div class="marker-label">' + m.label + '</div>';
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        window.parent.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }), '*');
      });

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([m.longitude, m.latitude])
        .addTo(map);
    });
  });
</script>
</body>
</html>`;
}

export function MapViewWrapper({ initialRegion, markers, onMarkerPress }: MapViewWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiKey = process.env.EXPO_PUBLIC_MAPTILER_KEY || "HalOFfShOFGRip19eGRc";
  const styleUrl = `https://api.maptiler.com/maps/019ac349-d5ee-795c-85cf-2cc023e13ad5/style.json?key=${apiKey}`;

  const html = useMemo(() => getMapHTML(
    markers,
    { lat: initialRegion.latitude, lng: initialRegion.longitude },
    15.5,
    apiKey,
    styleUrl,
  ), [markers, initialRegion, apiKey, styleUrl]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "markerPress" && data.id) {
          onMarkerPress(data.id);
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onMarkerPress]);

  const blob = useMemo(() => {
    const b = new Blob([html], { type: "text/html" });
    return URL.createObjectURL(b);
  }, [html]);

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef as any}
        src={blob}
        style={{ width: "100%", height: "100%", border: "none", borderRadius: 0 }}
        allow="geolocation"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
