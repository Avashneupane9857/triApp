import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';
import { encryptAES, encryptRSA, signMessage } from '../../src/utils/crypto';
import CryptoJS from 'crypto-js';

export default function SendMessageScreen() {
  const { recipientId } = useLocalSearchParams();
  const [recipient, setRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (recipientId) fetchRecipient();
  }, [recipientId]);

  const fetchRecipient = async () => {
    try {
      const res = await api.get(`/users/${recipientId}/publicKey`);
      setRecipient(res.data);
    } catch (err) {
      alert('Failed to load recipient');
    }
  };

  const handleSend = async () => {
    if (!recipient) return;
    setLoading(true);
    try {
      const aesKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex).slice(0, 16);
      const encryptedContent = encryptAES(message, aesKey);
      const encryptedKey = await encryptRSA(aesKey, recipient.publicKey);
      const privateKey = await SecureStore.getItemAsync('privateKey');
      const signature = await signMessage(message, privateKey);

      await api.post('/messages', {
        recipientId,
        encryptedContent,
        encryptedKey,
        signature,
        hmac: 'dummy',
        messageType: 'GENERAL',
      });

      setMessage('');
      router.replace('/(tabs)/sent');
    } catch (err) {
      alert('Error sending message');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✉️ Send Message</Text>
      <View style={styles.card}>
        {recipient && (
          <Text style={styles.recipient}>To: <Text style={styles.recipientName}>{recipient.username}</Text></Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor="#888"
        />
        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSend} disabled={!message || !recipient}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fa', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 32, color: '#222' },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  recipient: { fontSize: 16, marginBottom: 8, color: '#555' },
  recipientName: { fontWeight: 'bold', color: '#1976d2' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 14, minHeight: 80, marginBottom: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#1976d2', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});