import React, { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";

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

let maplibreLoaded = false;
let maplibreLoading = false;
const loadCallbacks: Array<() => void> = [];

function loadMapLibre(): Promise<void> {
  return new Promise((resolve) => {
    if (maplibreLoaded) {
      resolve();
      return;
    }
    loadCallbacks.push(resolve);
    if (maplibreLoading) return;
    maplibreLoading = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.maptiler.com/maplibre-gl-js/v4.7.1/maplibre-gl.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdn.maptiler.com/maplibre-gl-js/v4.7.1/maplibre-gl.js";
    script.onload = () => {
      maplibreLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export function MapViewWrapper({
  initialRegion,
  markers,
  onMarkerPress,
}: MapViewWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerElementsRef = useRef<any[]>([]);
  const onMarkerPressRef = useRef(onMarkerPress);
  onMarkerPressRef.current = onMarkerPress;

  const apiKey =
    process.env.EXPO_PUBLIC_MAPTILER_KEY || "HalOFfShOFGRip19eGRc";
  const styleUrl = `https://api.maptiler.com/maps/019ac349-d5ee-795c-85cf-2cc023e13ad5/style.json?key=${apiKey}`;

  useEffect(() => {
    let cancelled = false;

    loadMapLibre().then(() => {
      if (cancelled || !containerRef.current) return;
      const ml = (window as any).maplibregl;
      if (!ml) return;

      const map = new ml.Map({
        container: containerRef.current,
        style: styleUrl,
        center: [initialRegion.longitude, initialRegion.latitude],
        zoom: 15.5,
        pitch: 0,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 13,
      });

      map.addControl(
        new ml.NavigationControl({ showCompass: false }),
        "top-right"
      );

      mapInstanceRef.current = map;

      map.on("load", () => {
        if (cancelled) return;
        addMarkers(ml, map, markers);
      });
    });

    return () => {
      cancelled = true;
      markerElementsRef.current.forEach((m) => m.remove());
      markerElementsRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [styleUrl, initialRegion.latitude, initialRegion.longitude]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.loaded()) return;
    const ml = (window as any).maplibregl;
    if (!ml) return;
    markerElementsRef.current.forEach((m) => m.remove());
    markerElementsRef.current = [];
    addMarkers(ml, map, markers);
  }, [markers]);

  const addMarkers = useCallback(
    (ml: any, map: any, mkrs: MapMarker[]) => {
      mkrs.forEach((m) => {
        const el = document.createElement("div");
        el.style.cssText =
          "display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,46,93,0.3))";

        const head = document.createElement("div");
        head.textContent = String(m.count);
        head.style.cssText =
          "width:38px;height:38px;border-radius:50%;background:#002E5D;color:#fff;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;font-weight:700;font-size:15px;border:2.5px solid #fff;transition:transform .15s ease";

        const tail = document.createElement("div");
        tail.style.cssText =
          "width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #002E5D;margin-top:-1px";

        const name = document.createElement("div");
        name.textContent = m.label;
        name.style.cssText =
          "font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;font-size:10px;font-weight:600;color:#002E5D;background:rgba(255,255,255,0.94);padding:2px 6px;border-radius:4px;white-space:nowrap;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.08)";

        el.appendChild(head);
        el.appendChild(tail);
        el.appendChild(name);

        el.addEventListener("mouseenter", () => {
          head.style.transform = "scale(1.18)";
        });
        el.addEventListener("mouseleave", () => {
          head.style.transform = "scale(1)";
        });

        const markerId = m.id;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerPressRef.current(markerId);
        });

        const marker = new ml.Marker({ element: el, anchor: "bottom" })
          .setLngLat([m.longitude, m.latitude])
          .addTo(map);

        markerElementsRef.current.push(marker);
      });
    },
    []
  );

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    backgroundColor: "#e5e7eb",
    position: "relative" as const,
  },
});
