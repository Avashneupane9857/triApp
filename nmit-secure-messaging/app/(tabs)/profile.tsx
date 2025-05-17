import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Username: <Text style={styles.value}>{user?.username}</Text></Text>
        <Text style={styles.label}>Email: <Text style={styles.value}>{user?.email}</Text></Text>
        <Text style={styles.label}>Role: <Text style={styles.value}>{user?.userRole}</Text></Text>
        <Text style={styles.label}>Department: <Text style={styles.value}>{user?.department}</Text></Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fa', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, color: '#222' },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 16, marginBottom: 10, color: '#555' },
  value: { fontWeight: 'bold', color: '#1976d2' },
  button: { backgroundColor: '#d32f2f', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});