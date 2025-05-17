import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { username, password });
      await login(res.data.token, res.data.user);
      router.replace('/(tabs)/index');
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NMIT Secure Messaging</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push('/(auth)/register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
});