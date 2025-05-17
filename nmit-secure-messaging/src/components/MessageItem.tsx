import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MessageItem({ message, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View>
        <Text style={styles.title}>
          {message.sender?.username || message.recipient?.username}
        </Text>
        <Text numberOfLines={1} style={styles.preview}>
          {message.decryptedContent || '[Encrypted]'}
        </Text>
      </View>
      <Text style={styles.time}>
        {new Date(message.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  preview: { color: '#555', marginTop: 2, maxWidth: 180 },
  time: { color: '#888', fontSize: 12 },
});