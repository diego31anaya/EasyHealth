import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TouchableOpacity } from 'react-native';

export default function ExploreScreen() {
  const { user, signOut } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText style={styles.email}>{user?.email}</ThemedText>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: tintColor }]}
        onPress={signOut}>
        <ThemedText style={[styles.logoutText, { color: backgroundColor }]}>
          Sign Out
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  email: {
    opacity: 0.6,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});