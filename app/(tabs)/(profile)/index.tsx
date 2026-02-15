import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { EventSave, Reservation, Event, Club, Building } from "@/lib/types";
import * as store from "@/lib/store";
import { EventCard } from "@/components/EventCard";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuth();
  const [saves, setSaves] = useState<EventSave[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        const [s, r, e, c, b] = await Promise.all([
          store.getSaves(user.id),
          store.getReservations(user.id),
          store.getEvents(),
          store.getClubs(),
          store.getBuildings(),
        ]);
        setSaves(s);
        setReservations(r);
        setEvents(e);
        setClubs(c);
        setBuildings(b);
      })();
    }, [user])
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { paddingTop: topInset }]}>
        <Ionicons name="person-circle-outline" size={64} color={Colors.light.textTertiary} />
        <Text style={styles.emptyTitle}>Sign in to see your profile</Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.signInBtn}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const savedEventIds = new Set(saves.map(s => s.eventId));
  const reservedEventIds = new Set(reservations.map(r => r.eventId));
  const savedEvents = events.filter(e => savedEventIds.has(e.id));
  const reservedEvents = events.filter(e => reservedEventIds.has(e.id));

  const getClub = (id: string) => clubs.find(c => c.id === id);
  const getBuilding = (id: string) => buildings.find(b => b.id === id);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await logout();
        },
      },
    ]);
  };

  const handleUnsave = async (eventId: string) => {
    if (!user) return;
    await store.unsaveEvent(user.id, eventId);
    setSaves(prev => prev.filter(s => s.eventId !== eventId));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topInset, paddingBottom: 120 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push("/(tabs)/(profile)/notifications")} hitSlop={10}>
            <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{savedEvents.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{reservedEvents.length}</Text>
          <Text style={styles.statLabel}>Reservations</Text>
        </View>
      </View>

      {reservedEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Reservations</Text>
          {reservedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              club={getClub(event.clubId)}
              building={getBuilding(event.buildingId)}
              compact
            />
          ))}
        </View>
      )}

      {savedEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Events</Text>
          {savedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              club={getClub(event.clubId)}
              building={getBuilding(event.buildingId)}
              isSaved
              onSave={() => handleUnsave(event.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  signInBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  signInText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.borderLight,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.error,
  },
});
