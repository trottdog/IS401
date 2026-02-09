import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Colors from "@/constants/colors";

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
  mapRef?: React.Ref<MapView>;
}

export function MapViewWrapper({ initialRegion, markers, onMarkerPress, mapRef }: MapViewWrapperProps) {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsCompass={false}
      pitchEnabled={false}
    >
      {markers.map(m => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          onPress={() => onMarkerPress(m.id)}
        >
          <View style={styles.markerContainer}>
            <View style={styles.marker}>
              <Text style={styles.markerText}>{m.count}</Text>
            </View>
            <Text style={styles.markerLabel}>{m.label}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerContainer: {
    alignItems: "center",
    gap: 2,
  },
  marker: {
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  markerLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
});
