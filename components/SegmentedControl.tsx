import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((label, i) => {
        const isActive = i === selectedIndex;
        return (
          <Pressable
            key={label}
            onPress={() => {
              if (i !== selectedIndex) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(i);
              }
            }}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: Colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  segmentTextActive: {
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
});
