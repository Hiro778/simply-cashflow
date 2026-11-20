import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../hooks/useAppStore';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function RootNav() {
  const { initialize, isInitialized } = useAppStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {!isInitialized ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
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
  },
});
