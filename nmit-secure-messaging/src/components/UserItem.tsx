import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function UserItem({ user, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View>
        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.info}>{user.department} | {user.userRole}</Text>
      </View>
      <Text style={{ color: user.hasPublicKey ? 'green' : 'red' }}>
        {user.hasPublicKey ? '🔑' : 'No Key'}
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
  name: { fontWeight: 'bold', fontSize: 16 },
  info: { color: '#555', fontSize: 13 },
});