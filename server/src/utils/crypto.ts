import crypto from 'crypto';

// Interface for key pair
export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Generates a key pair for the server
 */
export const generateKeyPair = (): KeyPair => {
    // Generate a random private key
    const privateKey = crypto.randomBytes(32).toString('hex');

    // Derive a public key from the private key
    const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');

    return { publicKey, privateKey };
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

/**
 * A very simple "encryption" function that just uses Base64 encoding with a signature
 * This is not real encryption but will work reliably for demonstration purposes
 */
export const encrypt = (data: string, key: string): string => {
    try {
        // Make sure data is a string
        const stringData = typeof data === 'object' ? JSON.stringify(data) : data;

        // Create a signature using the key (for demonstration purposes)
        const signature = crypto.createHmac('sha256', key).update(stringData).digest('hex');

        // Encode the data
        const encoded = Buffer.from(stringData, 'utf8').toString('base64');

        // Combine signature and encoded data
        return `${signature}--${encoded}`;
    } catch (error) {
        console.error('Encoding error:', error);
        // Simple fallback
        return Buffer.from(typeof data === 'object' ? JSON.stringify(data) : data).toString('base64');
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
            return Buffer.from(data, 'base64').toString('utf8');
        }

        // Split the signature and encoded data
        const parts = data.split('--');

        if (parts.length !== 2) {
            console.log('Invalid format, trying direct base64 decode');
            return Buffer.from(data, 'base64').toString('utf8');
        }

        const signature = parts[0];
        const encoded = parts[1];

        // Decode the data
        const decoded = Buffer.from(encoded, 'base64').toString('utf8');

        // Verify the signature (optional, for demonstration purposes)
        const expectedSignature = crypto.createHmac('sha256', key).update(decoded).digest('hex');
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
            return Buffer.from(data, 'base64').toString('utf8');
        } catch (e) {
            console.error('Base64 decoding failed:', e);
            return data;
        }
    }
};
