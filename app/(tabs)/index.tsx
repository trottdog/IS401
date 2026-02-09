import React, { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Platform, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { Event, Club, Building, Category, EventSave, getTimeLabel, getTimeLabelColor, formatEventTime, formatEventDate } from "@/lib/types";
import * as store from "@/lib/store";
import { EventCard } from "@/components/EventCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { MapViewWrapper } from "@/components/MapViewWrapper";
import * as Haptics from "expo-haptics";

const BYU_REGION = {
  latitude: 40.2502,
  longitude: -111.6493,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saves, setSaves] = useState<EventSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showBuildingSheet, setShowBuildingSheet] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const loadData = useCallback(async () => {
    await store.initializeStore();
    const [e, c, b, cats] = await Promise.all([
      store.getEvents(),
      store.getClubs(),
      store.getBuildings(),
      store.getCategories(),
    ]);
    if (user) {
      const s = await store.getSaves(user.id);
      setSaves(s);
    }
    setEvents(e);
    setClubs(c);
    setBuildings(b);
    setCategories(cats);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const sortedEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter(e => !e.isCancelled && new Date(e.endTime) > now)
      .sort((a, b) => {
        const aStart = new Date(a.startTime);
        const bStart = new Date(b.startTime);
        const aEnd = new Date(a.endTime);
        const bEnd = new Date(b.endTime);
        const aNow = now >= aStart && now <= aEnd;
        const bNow = now >= bStart && now <= bEnd;
        if (aNow && !bNow) return -1;
        if (!aNow && bNow) return 1;
        return aStart.getTime() - bStart.getTime();
      });
  }, [events]);

  const buildingEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date();
    events.forEach(e => {
      if (!e.isCancelled && new Date(e.endTime) > now) {
        counts[e.buildingId] = (counts[e.buildingId] || 0) + 1;
      }
    });
    return counts;
  }, [events]);

  const buildingEvents = useMemo(() => {
    if (!selectedBuilding) return [];
    const now = new Date();
    return sortedEvents.filter(e => e.buildingId === selectedBuilding && new Date(e.endTime) > now);
  }, [selectedBuilding, sortedEvents]);

  const getClub = (id: string) => clubs.find(c => c.id === id);
  const getBuilding = (id: string) => buildings.find(b => b.id === id);
  const savedIds = new Set(saves.map(s => s.eventId));

  const handleSave = async (eventId: string) => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (savedIds.has(eventId)) {
      await store.unsaveEvent(user.id, eventId);
      setSaves(prev => prev.filter(s => s.eventId !== eventId));
    } else {
      const s = await store.saveEvent(user.id, eventId);
      setSaves(prev => [...prev, s]);
    }
  };

  const handleMarkerPress = (buildingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBuilding(buildingId);
    setShowBuildingSheet(true);
  };

  const mapMarkers = useMemo(() => {
    return buildings
      .filter(b => (buildingEventCounts[b.id] || 0) > 0)
      .map(b => ({
        id: b.id,
        latitude: b.latitude,
        longitude: b.longitude,
        count: buildingEventCounts[b.id] || 0,
        label: b.abbreviation,
      }));
  }, [buildings, buildingEventCounts]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: topInset }]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/search"); }}
          style={styles.searchBtn}
        >
          <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search events, clubs...</Text>
        </Pressable>
      </View>

      <SegmentedControl
        segments={["Map", "List"]}
        selectedIndex={viewMode}
        onChange={setViewMode}
      />

      {viewMode === 0 ? (
        <View style={styles.mapContainer}>
          <MapViewWrapper
            initialRegion={BYU_REGION}
            markers={mapMarkers}
            onMarkerPress={handleMarkerPress}
          />

          {showBuildingSheet && selectedBuilding && (
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderLeft}>
                  <Ionicons name="location" size={18} color={Colors.light.tint} />
                  <Text style={styles.sheetTitle}>
                    {getBuilding(selectedBuilding)?.name}
                  </Text>
                </View>
                <Pressable onPress={() => setShowBuildingSheet(false)} hitSlop={12}>
                  <Ionicons name="close-circle" size={26} color={Colors.light.textTertiary} />
                </Pressable>
              </View>
              <Text style={styles.sheetSubtitle}>
                {buildingEvents.length} upcoming event{buildingEvents.length !== 1 ? "s" : ""}
              </Text>
              <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
                {buildingEvents.length === 0 ? (
                  <Text style={styles.sheetEmpty}>No upcoming events at this location</Text>
                ) : (
                  buildingEvents.map((evt) => {
                    const club = getClub(evt.clubId);
                    const label = getTimeLabel(evt.startTime, evt.endTime);
                    const labelColor = getTimeLabelColor(label);
                    return (
                      <Pressable
                        key={evt.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push({ pathname: "/event/[id]", params: { id: evt.id } });
                        }}
                        style={({ pressed }) => [styles.previewCard, { opacity: pressed ? 0.85 : 1 }]}
                      >
                        <View style={styles.previewTop}>
                          <View style={[styles.previewBadge, { backgroundColor: labelColor + "18" }]}>
                            <Text style={[styles.previewBadgeText, { color: labelColor }]}>{label}</Text>
                          </View>
                          {evt.hasFood && (
                            <MaterialIcons name="restaurant" size={14} color={Colors.light.warning} />
                          )}
                          <View style={styles.previewArrow}>
                            <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} />
                          </View>
                        </View>
                        <Text style={styles.previewTitle} numberOfLines={2}>{evt.title}</Text>
                        <Text style={styles.previewDesc} numberOfLines={2}>{evt.description}</Text>
                        <View style={styles.previewMeta}>
                          <View style={styles.previewMetaItem}>
                            <Ionicons name="time-outline" size={13} color={Colors.light.textSecondary} />
                            <Text style={styles.previewMetaText}>
                              {formatEventTime(evt.startTime)} · {formatEventDate(evt.startTime)}
                            </Text>
                          </View>
                          <View style={styles.previewMetaItem}>
                            <Ionicons name="navigate-outline" size={13} color={Colors.light.textSecondary} />
                            <Text style={styles.previewMetaText}>
                              Room {evt.room}
                            </Text>
                          </View>
                        </View>
                        {club && (
                          <View style={styles.previewClub}>
                            <View style={[styles.previewClubDot, { backgroundColor: club.imageColor }]} />
                            <Text style={styles.previewClubName}>{club.name}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              club={getClub(item.clubId)}
              building={getBuilding(item.buildingId)}
              isSaved={savedIds.has(item.id)}
              onSave={() => handleSave(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No upcoming events</Text>
              <Text style={styles.emptySubtitle}>Check back later for new events</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  mapContainer: { flex: 1, marginTop: 8 },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  sheetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    flex: 1,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 2,
  },
  sheetList: { paddingBottom: 24, paddingHorizontal: 16 },
  sheetEmpty: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  previewCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  previewBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  previewBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  previewArrow: {
    marginLeft: "auto" as const,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 21,
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 6,
  },
  previewMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previewMetaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  previewClub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  previewClubDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  previewClubName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
