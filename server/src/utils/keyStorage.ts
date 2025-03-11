import fs from 'fs';
import path from 'path';
import { generateKeyPair } from './crypto';

const KEY_FILE_PATH = path.join(__dirname, '../../keys.json');

interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Loads existing keys from file or generates new ones if they don't exist
 */
export const getOrCreateKeyPair = (): KeyPair => {
    try {
        // Check if keys file exists
        if (fs.existsSync(KEY_FILE_PATH)) {
            console.log('Loading existing keys from file');
            const keysData = fs.readFileSync(KEY_FILE_PATH, 'utf8');
            return JSON.parse(keysData);
        } else {
            console.log('No existing keys found, generating new key pair');
            return createAndSaveNewKeyPair();
        }
    } catch (error) {
        console.error('Error loading keys, generating new ones:', error);
        return createAndSaveNewKeyPair();
    }
};

/**
 * Generates a new key pair and saves it to file
 */
const createAndSaveNewKeyPair = (): KeyPair => {
    const keyPair = generateKeyPair();

    try {
        fs.writeFileSync(KEY_FILE_PATH, JSON.stringify(keyPair, null, 2));
        console.log('New keys generated and saved to file');
    } catch (error) {
        console.error('Failed to save keys to file:', error);
    }

    return keyPair;
};

/**
 * Forces generation of a new key pair
 */
export const regenerateKeyPair = (): KeyPair => {
    console.log('Regenerating key pair');
    return createAndSaveNewKeyPair();
}; 