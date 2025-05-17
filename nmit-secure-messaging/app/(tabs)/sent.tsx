import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../src/api/api';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStoreWebShim as SecureStore } from '../../src/utils/SecureStore';
import MessageItem from '../../src/components/MessageItem';
import { decryptAES, decryptRSA } from '../../src/utils/crypto';

export default function SentScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages/sent');
      // Optionally decrypt your own sent messages if you want
      setMessages(res.data.messages);
    } catch (err) {
      Alert.alert('Error', 'Failed to load sent messages');
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', margin: 16 }}>Sent Messages</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        onRefresh={fetchMessages}
        refreshing={loading}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No sent messages</Text>}
      />
    </View>
  );
}