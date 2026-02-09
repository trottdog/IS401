import React, { useRef, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

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
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  #map { width: 100%; height: 100%; }
  .marker-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    gap: 2px;
  }
  .marker-badge {
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background: #002E5D;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    font-weight: 700;
    font-size: 15px;
    box-shadow: 0 2px 10px rgba(0,46,93,0.35);
    border: 2.5px solid white;
  }
  .marker-label {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #002E5D;
    background: rgba(255,255,255,0.95);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var markers = ${markersJSON};

  var map = new maplibregl.Map({
    container: 'map',
    style: '${styleUrl}',
    center: [${center.lng}, ${center.lat}],
    zoom: ${zoom},
    pitch: 0,
    attributionControl: false
  });

  map.on('load', function() {
    markers.forEach(function(m) {
      var el = document.createElement('div');
      el.className = 'marker-container';
      el.innerHTML = '<div class="marker-badge">' + m.count + '</div><div class="marker-label">' + m.label + '</div>';
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
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
  const webViewRef = useRef<WebView>(null);
  const apiKey = process.env.EXPO_PUBLIC_MAPTILER_KEY || "HalOFfShOFGRip19eGRc";
  const styleUrl = `https://api.maptiler.com/maps/019ac349-d5ee-795c-85cf-2cc023e13ad5/style.json?key=${apiKey}`;

  const html = useMemo(() => getMapHTML(
    markers,
    { lat: initialRegion.latitude, lng: initialRegion.longitude },
    15.5,
    apiKey,
    styleUrl,
  ), [markers, initialRegion, apiKey, styleUrl]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "markerPress" && data.id) {
        onMarkerPress(data.id);
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
