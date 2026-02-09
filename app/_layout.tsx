import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'

import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ActivityIndicator, View, StyleSheet} from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { user, loading, } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if(!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading])

  if(loading) {
    return null;
  }

  const inAuthGroup = segments.length > 0 && segments[0] === 'auth';

  // Redirect BEFORE rendering the Stack — no flash
  if (!user && !inAuthGroup) {
    return <Redirect href="/auth/login" />;
  }
  if (user && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false,
        animation: 'none'
        }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false,
        animation: 'none'
        }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
})