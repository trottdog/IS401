import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  mapRef?: any;
}

export function MapViewWrapper({ markers, onMarkerPress }: MapViewWrapperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map-outline" size={32} color={Colors.light.textTertiary} />
        <Text style={styles.title}>BYU Campus</Text>
        <Text style={styles.subtitle}>Map view available on mobile. Tap a building below:</Text>
      </View>
      <View style={styles.grid}>
        {markers.map(m => (
          <View
            key={m.id}
            style={styles.buildingCard}
            onTouchEnd={() => onMarkerPress(m.id)}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{m.count}</Text>
            </View>
            <Text style={styles.buildingLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  buildingCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  buildingLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    textAlign: "center",
  },
});
