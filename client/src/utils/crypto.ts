import CryptoJS from 'crypto-js';

// Interface for key pair
export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Generates a key pair for the client
 * Note: In a real-world application, you would use a proper asymmetric encryption library
 * This is a simplified version for demonstration purposes
 */
export const generateKeyPair = (): KeyPair => {
    // Generate a random private key
    const privateKey = CryptoJS.lib.WordArray.random(32).toString();

    // Derive a public key from the private key
    // In a real implementation, this would use proper asymmetric key generation
    const publicKey = CryptoJS.SHA256(privateKey).toString();

    return { publicKey, privateKey };
};

/**
 * Determines if a key is a PEM-formatted server key
 */
export const isServerKey = (key: string): boolean => {
    return key.includes('-----BEGIN') && key.includes('KEY-----');
};

/**
 * Encrypts data using the recipient's public key
 */
export const encrypt = (data: string, publicKey: string): string => {
    // In a real implementation, this would use the recipient's public key for asymmetric encryption
    // For simplicity, we're using the public key as an encryption key
    try {
        // Check if the key looks like a PEM format (server key)
        if (isServerKey(publicKey)) {
            // We can't handle PEM keys in the browser, so we'll use a hash of the key
            const keyHash = CryptoJS.SHA256(publicKey).toString();
            return CryptoJS.AES.encrypt(data, keyHash).toString();
        } else {
            // Use the key directly for client keys
            return CryptoJS.AES.encrypt(data, publicKey).toString();
        }
    } catch (error) {
        console.error('Encryption error:', error);
        // Simple fallback
        return btoa(data);
    }
};

/**
 * Decrypts data using the client's private key
 */
export const decrypt = (encryptedData: string, privateKey: string): string => {
    // In a real implementation, this would use the client's private key for asymmetric decryption
    // For simplicity, we're using the private key as a decryption key
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, privateKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        // Simple fallback
        try {
            return atob(encryptedData);
        } catch (e) {
            return encryptedData;
        }
    }
};
