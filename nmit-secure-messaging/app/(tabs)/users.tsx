import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../src/api/api';
import UserItem from '../../src/components/UserItem';
import { useRouter } from 'expo-router';

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      Alert.alert('Error', 'Failed to load users');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', margin: 16 }}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={() => router.push({ pathname: '/(tabs)/send', params: { recipientId: item.id } })}
          />
        )}
        onRefresh={fetchUsers}
        refreshing={loading}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No users found</Text>}
      />
    </View>
  );
}