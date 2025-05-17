import RNRSA from 'react-native-rsa-native';
import CryptoJS from 'crypto-js';
import forge from 'node-forge';

// Helper to detect web
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Generate RSA key pair
export const generateKeyPair = async () => {
  if (isWeb) {
    // Web: use node-forge
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, function (err, keypair) {
        if (err) return reject(err);
        resolve({
          public: forge.pki.publicKeyToPem(keypair.publicKey),
          private: forge.pki.privateKeyToPem(keypair.privateKey),
        });
      });
    });
  } else {
    // Native: use react-native-rsa-native
    return await RNRSA.generateKeys(2048);
  }
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
  if (isWeb) {
    const pub = forge.pki.publicKeyFromPem(publicKey);
    const encrypted = pub.encrypt(forge.util.encodeUtf8(text), 'RSAES-PKCS1-V1_5');
    return forge.util.encode64(encrypted);
  } else {
    return await RNRSA.encrypt(text, publicKey);
  }
};

// Decrypt AES key with RSA private key
export const decryptRSA = async (cipher, privateKey) => {
  if (isWeb) {
    const priv = forge.pki.privateKeyFromPem(privateKey);
    const decrypted = priv.decrypt(forge.util.decode64(cipher), 'RSAES-PKCS1-V1_5');
    return forge.util.decodeUtf8(decrypted);
  } else {
    return await RNRSA.decrypt(cipher, privateKey);
  }
};

// Sign message
export const signMessage = async (message, privateKey) => {
  if (isWeb) {
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    const priv = forge.pki.privateKeyFromPem(privateKey);
    const signature = priv.sign(md);
    return forge.util.encode64(signature);
  } else {
    return await RNRSA.sign(message, privateKey, 'SHA256');
  }
};

// Verify signature
export const verifySignature = async (message, signature, publicKey) => {
  if (isWeb) {
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    const pub = forge.pki.publicKeyFromPem(publicKey);
    const sigBytes = forge.util.decode64(signature);
    return pub.verify(md.digest().bytes(), sigBytes);
  } else {
    return await RNRSA.verify(message, signature, publicKey, 'SHA256');
  }
};

const aesKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex).slice(0, 16);