import { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// ATTENTION FOR NOW SKIP EMAIL VERIFICATION MAKE SURE TO DISABLE THIS LATER

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else {
      Alert.alert(
        'Success!',
        'Account created successfully. Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor, paddingTop: insets.top, paddingBottom: insets.bottom},]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Create Account
          </ThemedText>
          <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: tintColor }]}
              onPress={handleSignup}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={backgroundColor} />
              ) : (
                <ThemedText style={[styles.buttonText, {color: backgroundColor}]}>Sign Up</ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <ThemedText>Already have an account? </ThemedText>
              <Link href="/auth/login" asChild>
                <TouchableOpacity disabled={loading}>
                  <ThemedText style={{ color: tintColor, fontWeight: '600' }}>
                    Sign In
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    alignItems: 'center',
  },
});