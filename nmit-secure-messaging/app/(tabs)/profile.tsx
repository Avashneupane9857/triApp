import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleShowPrivateKey = async () => {
    const privateKey = await SecureStore.getItemAsync('privateKey');
    Alert.alert('Your Private Key', privateKey || 'Not found');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <>
          <Text>Username: {user.username}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Role: {user.userRole}</Text>
          <Text>Department: {user.department}</Text>
        </>
      )}
      <Button title="Show My Private Key" onPress={handleShowPrivateKey} />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});