import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect } from 'react';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="send" options={{ title: 'Send' }} />
      <Tabs.Screen name="sent" options={{ title: 'Sent' }} />
      <Tabs.Screen name="users" options={{ title: 'Users' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}