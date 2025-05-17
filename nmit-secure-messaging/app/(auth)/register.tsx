import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';
import { generateKeyPair } from '../../src/utils/crypto';

export default function RegisterScreen() {
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
      console.log('Register: Sending registration request:', { username, email, password, department, userRole });
      // 2. Register user
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        department,
        userRole,
      });
      console.log('Register: Registration response:', res.data);
      // 3. Upload public key
      console.log('Register: Uploading public key...');
      await api.put('/auth/publicKey', { publicKey }, {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      console.log('Register: Public key uploaded.');
      // 4. Store private key securely
      await SecureStore.setItemAsync('privateKey', privateKey);
      // 5. Login
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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Department" value={department} onChangeText={setDepartment} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Text style={{ marginBottom: 4 }}>Role</Text>
      <Picker
        selectedValue={userRole}
        onValueChange={setUserRole}
        style={styles.input}
      >
        <Picker.Item label="Student" value="STUDENT" />
        <Picker.Item label="Faculty" value="FACULTY" />
        <Picker.Item label="Admin" value="ADMIN" />
      </Picker>
      {loading ? <ActivityIndicator /> : <Button title="Register" onPress={handleRegister} />}
      <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
});