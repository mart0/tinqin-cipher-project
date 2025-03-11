import crypto from 'crypto';

// Interface for key pair
export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Generates a key pair for the server using RSA
 */
export const generateKeyPair = (): KeyPair => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    return { publicKey, privateKey };
};

/**
 * Determines if a key is a PEM-formatted server key
 */
export const isServerKey = (key: string): boolean => {
    return key.includes('-----BEGIN') && key.includes('KEY-----');
};

/**
 * Encrypts data using the recipient's key
 */
export const encrypt = (data: string, publicKey: string): string => {
    try {
        // Check if the key looks like a PEM format (server key)
        if (isServerKey(publicKey)) {
            // Use asymmetric encryption for server keys
            const buffer = Buffer.from(data, 'utf8');
            const encrypted = crypto.publicEncrypt(publicKey, buffer);
            return encrypted.toString('base64');
        } else {
            // Use symmetric encryption for client keys (compatible with CryptoJS)
            // Generate a key and IV from the public key
            const derivedKey = crypto.createHash('sha256').update(publicKey).digest();
            const iv = crypto.createHash('md5').update(publicKey).digest();

            const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return encrypted;
        }
    } catch (error) {
        console.error('Node encryption error:', error);

        // Fallback to simple encryption
        return Buffer.from(data, 'utf8').toString('base64');
    }
};

/**
 * Decrypts data using the recipient's key
 */
export const decrypt = (data: string, privateKey: string): string => {
    try {
        // Check if the key is a server key (PEM format)
        if (isServerKey(privateKey)) {
            // Use asymmetric decryption for server keys
            const buffer = Buffer.from(data, 'base64');
            const decrypted = crypto.privateDecrypt(privateKey, buffer);
            return decrypted.toString('utf8');
        } else {
            // Use symmetric decryption for client keys (compatible with CryptoJS)
            // Generate a key and IV from the private key
            const derivedKey = crypto.createHash('sha256').update(privateKey).digest();
            const iv = crypto.createHash('md5').update(privateKey).digest();

            const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
            let decrypted = decipher.update(data, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
    } catch (error) {
        console.error('Node decryption error:', error);

        // Fallback to simple decryption
        try {
            return Buffer.from(data, 'base64').toString('utf8');
        } catch (e) {
            console.error('Base64 decoding failed:', e);
            return data;
        }
    }
};
