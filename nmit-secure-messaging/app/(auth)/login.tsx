import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      console.log('Login: Sending login request:', { username, password });
      const res = await api.post('/auth/login', { username, password });
      console.log('Login: Login response:', res.data);
      await login(res.data.token, res.data.user);
      console.log('Login: Login complete, navigating to /tabs/index');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login: Error:', err, err?.response?.data);
      Alert.alert('Login failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>🔒 NMIT Secure Messaging</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>Don't have an account? <Text style={{ textDecorationLine: 'underline' }}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fa', padding: 24 },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 36, color: '#222', letterSpacing: 0.5 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 18, padding: 28, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 16, marginBottom: 18, fontSize: 16, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#1976d2', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 8, shadowColor: '#1976d2', shadowOpacity: 0.15, shadowRadius: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },
  link: { marginTop: 22, alignItems: 'center' },
  linkText: { color: '#1976d2', fontSize: 15, fontWeight: '500' },
});

export default LoginScreen;