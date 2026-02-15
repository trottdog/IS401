import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Platform, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { Club, ClubMembership, Category } from "@/lib/types";
import * as store from "@/lib/store";
import { ClubCard } from "@/components/ClubCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import * as Haptics from "expo-haptics";

export default function MyClubsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const loadData = useCallback(async () => {
    if (!user) return;
    const [m, c, cats] = await Promise.all([
      store.getMemberships(user.id),
      store.getClubs(),
      store.getCategories(),
    ]);
    setMemberships(m);
    setAllClubs(c);
    setCategories(cats);
    const myClubIds = new Set(m.map(x => x.clubId));
    setClubs(c.filter(cl => myClubIds.has(cl.id)));
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

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { paddingTop: topInset }]}>
        <Ionicons name="people-outline" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.emptyTitle}>Sign in to see your clubs</Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.signInBtn}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const myClubIds = new Set(memberships.map(m => m.clubId));
  const discoverClubs = allClubs.filter(c => !myClubIds.has(c.id));

  const getMemberRole = (clubId: string) => {
    return memberships.find(m => m.clubId === clubId)?.role;
  };

  const getCategory = (catId: string) => categories.find(c => c.id === catId);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Clubs</Text>
      </View>

      <SegmentedControl
        segments={["My Clubs", "Discover"]}
        selectedIndex={tab}
        onChange={setTab}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : tab === 0 ? (
        <FlatList
          data={clubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClubCard
              club={item}
              category={getCategory(item.categoryId)}
              isMember
              role={getMemberRole(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No clubs yet</Text>
              <Text style={styles.emptySubtitle}>Explore clubs and join ones you like</Text>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(1); }} style={styles.exploreBtn}>
                <Text style={styles.exploreBtnText}>Explore Clubs</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <FlatList
          data={discoverClubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClubCard club={item} category={getCategory(item.categoryId)} />
          )}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>You've joined all clubs!</Text>
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
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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
  exploreBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  exploreBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
