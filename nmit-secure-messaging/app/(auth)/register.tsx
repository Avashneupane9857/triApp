import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';
import { generateKeyPair } from '../../src/utils/crypto';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    try {
      console.log('Register: Generating key pair...');
      // 1. Generate key pair
      const { public: publicKey, private: privateKey } = await generateKeyPair();
      console.log('Register: Key pair generated.');
      console.log('Register: Sending registration request:', { username, email, password, department, userRole, publicKey });
      // 2. Register user
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        department,
        userRole,
        publicKey,
      });
      console.log('Register: Registration response:', res.data);
      // 3. Store private key locally
      await SecureStore.setItemAsync('privateKey', privateKey);
      // 4. Login
      console.log('Register: Logging in...');
      await login(res.data.token, res.data.user);
      console.log('Register: Login complete, navigating to /tabs/index');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Register: Error:', err, err?.response?.data);
      Alert.alert('Registration failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>📝 Register</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Department" value={department} onChangeText={setDepartment} placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#888" />
        <Text style={{ marginBottom: 4, color: '#555', fontWeight: '500' }}>Role</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={userRole}
            onValueChange={setUserRole}
            style={styles.picker}
            dropdownIconColor="#1976d2"
          >
            <Picker.Item label="Student" value="STUDENT" />
            <Picker.Item label="Faculty" value="FACULTY" />
            <Picker.Item label="Admin" value="ADMIN" />
          </Picker>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.link} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.linkText}>Back to Login</Text>
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
  pickerWrapper: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, marginBottom: 18, backgroundColor: '#f9f9f9' },
  picker: { height: 44, color: '#222' },
  button: { backgroundColor: '#1976d2', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 8, shadowColor: '#1976d2', shadowOpacity: 0.15, shadowRadius: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },
  link: { marginTop: 22, alignItems: 'center' },
  linkText: { color: '#1976d2', fontSize: 15, fontWeight: '500' },
});

export default RegisterScreen;