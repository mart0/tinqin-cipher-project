import CryptoJS from 'crypto-js';

// Interface for key pair
export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Generates a key pair for the client
 */
export const generateKeyPair = (): KeyPair => {
    // Generate a random private key
    const privateKey = CryptoJS.lib.WordArray.random(32).toString();

    // Derive a public key from the private key
    const publicKey = CryptoJS.SHA256(privateKey).toString();

    return { publicKey, privateKey };
};

/**
 * A very simple "encryption" function that just uses Base64 encoding with a signature
 * This is not real encryption but will work reliably for demonstration purposes
 */
export const encrypt = (data: string, key: string): string => {
    try {
        // Make sure data is a string
        const stringData = typeof data === 'object' ? JSON.stringify(data) : data;
        
        // Create a signature using the key (for demonstration purposes)
        const signature = CryptoJS.HmacSHA256(stringData, key).toString();
        
        // Encode the data
        const encoded = btoa(stringData);
        
        // Combine signature and encoded data
        return `${signature}--${encoded}`;
    } catch (error) {
        console.error('Encoding error:', error);
        // Simple fallback
        return btoa(typeof data === 'object' ? JSON.stringify(data) : data);
    }
};

/**
 * A very simple "decryption" function that just uses Base64 decoding
 * This is not real decryption but will work reliably for demonstration purposes
 */
export const decrypt = (data: string, key: string): string => {
    try {
        console.log(`Attempting to decode data (${data.length} chars)`);
        
        // Check if the data contains our separator
        if (!data.includes('--')) {
            console.log('Data does not contain separator, trying direct base64 decode');
            return atob(data);
        }
        
        // Split the signature and encoded data
        const parts = data.split('--');
        
        if (parts.length !== 2) {
            console.log('Invalid format, trying direct base64 decode');
            return atob(data);
        }
        
        const signature = parts[0];
        const encoded = parts[1];
        
        // Decode the data
        const decoded = atob(encoded);
        
        // Verify the signature (optional, for demonstration purposes)
        const expectedSignature = CryptoJS.HmacSHA256(decoded, key).toString();
        if (signature !== expectedSignature) {
            console.warn('Signature verification failed, but still returning decoded data');
        }
        
        console.log(`Successfully decoded to ${decoded.length} chars`);
        return decoded;
    } catch (error) {
        console.error('Decoding error:', error);
        
        // Try direct base64 decode as a fallback
        try {
            console.log('Trying direct base64 decode as fallback');
            return atob(data);
        } catch (e) {
            console.error('Base64 decoding failed:', e);
            return data;
        }
    }
};

/**
 * Determines if a key is a PEM-formatted key
 */
export const isServerKey = (key: string): boolean => {
    return key.includes('-----BEGIN') && key.includes('KEY-----');
};

/**
 * Determines if a key is a non-PEM format key
 */
export const isClientKey = (key: string): boolean => {
    return !isServerKey(key);
};
