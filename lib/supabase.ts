import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Custom storage adapter for Supabase auth
 * Uses SecureStore on mobile for enchanced security
 * Falls back to AsyncStorage on web
 */
class SupabaseStorage {
    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') {
                return null;
            }
            return localStorage.getItem(key)
        }
        return SecureStore.getItemAsync(key)
    }

    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
            }
            return;
        }
        await SecureStore.setItemAsync(key, value)
    }

    async removeItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
            return;
        }
        await SecureStore.deleteItemAsync(key);
    }
}

 export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: new SupabaseStorage(),
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }) 