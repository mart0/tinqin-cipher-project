import { generateKeyPair, KeyPair } from '../utils/crypto';

const KEY_STORAGE_KEY = 'client_keys';

/**
 * Gets the client's key pair from localStorage or generates a new one if none exists
 */
export const getOrCreateClientKeys = (): KeyPair => {
    // Try to get existing keys from localStorage
    const storedKeys = localStorage.getItem(KEY_STORAGE_KEY);

    if (storedKeys) {
        try {
            console.log('Loading existing client keys from localStorage');
            return JSON.parse(storedKeys) as KeyPair;
        } catch (error) {
            console.error('Error parsing stored keys, generating new ones:', error);
            return createAndSaveNewKeyPair();
        }
    } else {
        console.log('No existing client keys found, generating new key pair');
        return createAndSaveNewKeyPair();
    }
};

/**
 * Generates a new key pair and saves it to localStorage
 */
const createAndSaveNewKeyPair = (): KeyPair => {
    const keyPair = generateKeyPair();

    try {
        localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(keyPair));
        console.log('New client keys generated and saved to localStorage');
    } catch (error) {
        console.error('Failed to save keys to localStorage:', error);
    }

    return keyPair;
};

/**
 * Forces regeneration of a new key pair
 */
export const regenerateClientKeys = (): KeyPair => {
    console.log('Regenerating client key pair');
    return createAndSaveNewKeyPair();
}; 