import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../hooks/useAppStore';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

function RootNav() {
  const { initialize, isInitialized, initError } = useAppStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {!isInitialized ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          {initError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorTitle, { color: colors.text }]}>
                Gagal Memuat Aplikasi
              </Text>
              <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                {initError}
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={() => initialize()}
                activeOpacity={0.8}
              >
                <Text style={[styles.retryBtnText, { color: isDark ? '#080F0C' : '#FFFFFF' }]}>
                  Coba Lagi
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loadingInner}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              title: 'Pengaturan',
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="smart-capture"
            options={{
              headerShown: true,
              title: 'Smart Capture',
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="recurring"
            options={{
              headerShown: true,
              title: 'Transaksi Rutin',
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="calendar"
            options={{
              headerShown: true,
              title: 'Kalender Keuangan',
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="recap"
            options={{
              headerShown: true,
              title: 'Rekap Keuangan',
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="privacy"
            options={{
              headerShown: true,
              title: 'Privasi & Keamanan',
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          />
        </Stack>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 360,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
