import * as SecureStore from 'expo-secure-store';

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const SecureStoreWebShim = {
  async getItemAsync(key) {
    if (isWeb) return Promise.resolve(localStorage.getItem(key));
    return SecureStore.getItemAsync(key);
  },
  async setItemAsync(key, value) {
    if (isWeb) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItemAsync(key) {
    if (isWeb) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
}; 