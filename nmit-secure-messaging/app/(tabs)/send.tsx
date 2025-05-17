import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';
import { encryptAES, encryptRSA, signMessage } from '../../src/utils/crypto';

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
      Alert.alert('Error', 'Failed to load recipient');
    }
  };

  const handleSend = async () => {
    if (!recipient) return;
    setLoading(true);
    try {
      // 1. Generate AES key
      const aesKey = Math.random().toString(36).slice(2, 18); // 16 chars
      // 2. Encrypt message with AES
      const encryptedContent = encryptAES(message, aesKey);
      // 3. Encrypt AES key with recipient's public key
      const encryptedKey = await encryptRSA(aesKey, recipient.publicKey);
      // 4. Sign the message
      const privateKey = await SecureStore.getItemAsync('privateKey');
      const signature = await signMessage(message, privateKey);
      // 5. (Optional) HMAC - for now, just use signature as placeholder
      const hmac = signature;
      // 6. Send
      await api.post('/messages', {
        recipientId,
        encryptedContent,
        encryptedKey,
        signature,
        hmac,
        messageType: 'GENERAL',
      });
      Alert.alert('Success', 'Message sent!');
      setMessage('');
      router.replace('/(tabs)/sent');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Message</Text>
      {recipient && (
        <Text style={styles.recipient}>To: {recipient.username}</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        value={message}
        onChangeText={setMessage}
        multiline
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Send" onPress={handleSend} disabled={!message || !recipient} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  recipient: { fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, minHeight: 80, marginBottom: 12 },
});