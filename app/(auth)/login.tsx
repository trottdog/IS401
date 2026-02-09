import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("student@byu.edu");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.dismissAll();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Invalid email or password");
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.titleBrand}>BYUconnect</Text>
          <Text style={styles.subtitle}>Sign in to discover campus events</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@byu.edu"
              placeholderTextColor={Colors.light.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.light.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              loading && { opacity: 0.7 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Text style={styles.link}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  titleBrand: { fontSize: 36, fontFamily: "Inter_700Bold", color: Colors.light.tint, marginTop: 4 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 8 },
  form: { gap: 20 },
  inputWrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  input: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceSecondary,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    alignItems: "center" as const,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  link: { color: Colors.light.accent, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    padding: 24,
    gap: 4,
  },
  footerText: { color: Colors.light.textSecondary, fontSize: 14, fontFamily: "Inter_400Regular" },
});
