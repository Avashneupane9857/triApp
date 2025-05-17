import RNRSA from 'react-native-rsa-native';
import CryptoJS from 'crypto-js';

// Generate RSA key pair
export const generateKeyPair = async () => {
  return await RNRSA.generateKeys(2048); // { private: ..., public: ... }
};

// Encrypt message with AES
export const encryptAES = (text, key) => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

// Decrypt message with AES
export const decryptAES = (cipher, key) => {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Encrypt AES key with RSA public key
export const encryptRSA = async (text, publicKey) => {
  return await RNRSA.encrypt(text, publicKey);
};

// Decrypt AES key with RSA private key
export const decryptRSA = async (cipher, privateKey) => {
  return await RNRSA.decrypt(cipher, privateKey);
};

// Sign message
export const signMessage = async (message, privateKey) => {
  return await RNRSA.sign(message, privateKey, 'SHA256');
};

// Verify signature
export const verifySignature = async (message, signature, publicKey) => {
  return await RNRSA.verify(message, signature, publicKey, 'SHA256');
};