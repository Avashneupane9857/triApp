import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MessageItem({ message, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.85}>
      <View>
      <Text style={styles.sender}>{message.sender?.username || message.senderName || message.senderId}</Text>
        <Text style={styles.content}>{message.decryptedContent || '[Encrypted]'}</Text>
        <Text style={styles.time}>{new Date(message.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sender: { fontWeight: 'bold', color: '#1976d2', marginBottom: 4 },
  content: { fontSize: 16, color: '#222', marginBottom: 6 },
  time: { fontSize: 12, color: '#888', textAlign: 'right' },
});