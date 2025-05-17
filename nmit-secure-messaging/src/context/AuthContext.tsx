import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecureStoreWebShim as SecureStore } from '../utils/SecureStore';
import { setAuthToken, api } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load token/user from secure storage on app start
    (async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAuthToken(storedToken);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (token, user) => {
    setToken(token);
    setUser(user);
    setAuthToken(token);
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    console.log('AuthContext login, token:', token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}