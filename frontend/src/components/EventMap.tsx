import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const BYU_CENTER: [number, number] = [-111.6493, 40.2502];
const DEFAULT_ZOOM = 15.5;

/** Free tile style - no API key. */
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  label: string;
}

interface EventMapProps {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
  /** Fixed height so the map container always has dimensions (required for MapLibre to render). */
  height?: number;
}

export default function EventMap({ markers, onMarkerClick, height = 280 }: EventMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    setError(null);
    setLoading(true);

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: BYU_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.resize();
      setLoading(false);
      setMapReady(true);
    });

    map.on("error", (e) => {
      console.error("Map error:", e);
      setError("Map failed to load.");
      setLoading(false);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setLoading(false);
      setError(null);
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((m) => {
      const el = document.createElement("div");
      el.className = "event-map-marker";
      el.innerHTML = `
        <div class="event-map-marker-bubble">${m.count}</div>
        <div class="event-map-marker-tail"></div>
        <div class="event-map-marker-label">${escapeHtml(m.label)}</div>
      `;
      el.style.cursor = onMarkerClick ? "pointer" : "default";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClick?.(m.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([m.longitude, m.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = requestAnimationFrame(() => {
      map.resize();
    });
    return () => cancelAnimationFrame(t);
  }, [height]);

  return (
    <div className="event-map-wrap" style={{ position: "relative", width: "100%", height: height }}>
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {loading && (
        <div
          className="event-map-loading"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Loading map…
        </div>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 14,
            padding: 16,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
      <style>{`
        .event-map-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .event-map-marker-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #002E5D;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, system-ui, sans-serif;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0,46,93,.35);
          transition: transform .12s;
        }
        .event-map-marker:hover .event-map-marker-bubble {
          transform: scale(1.1);
        }
        .event-map-marker-tail {
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #002E5D;
          margin-top: -1px;
        }
        .event-map-marker-label {
          font-family: -apple-system, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #002E5D;
          background: rgba(255,255,255,.95);
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          margin-top: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,.1);
        }
      `}</style>
    </div>
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
