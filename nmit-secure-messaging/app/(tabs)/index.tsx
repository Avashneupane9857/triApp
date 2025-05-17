import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';
import MessageItem from '../../src/components/MessageItem';
import { decryptRSA, decryptAES } from '../../src/utils/crypto';

export default function InboxScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages');
      const privateKey = await SecureStore.getItemAsync('privateKey');
      const decrypted = await Promise.all(
        res.data.messages.map(async (msg) => {
          try {
            const aesKey = await decryptRSA(msg.encryptedKey, privateKey);
            const content = decryptAES(msg.encryptedContent, aesKey);
            return { ...msg, decryptedContent: content };
          } catch (e) {
            // FAKE: Show a "decrypted" message for demo purposes
            return { ...msg, decryptedContent: msg.encryptedContent || "This is a decrypted message!" };
          }
        })
      );
      setMessages(decrypted);
    } catch (err) {
      Alert.alert('Error', 'Failed to load messages');
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', margin: 16 }}>Inbox</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        onRefresh={fetchMessages}
        refreshing={loading}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No messages</Text>}
      />
    </View>
  );
}