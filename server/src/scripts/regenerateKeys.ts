import { regenerateKeyPair } from '../utils/keyStorage';

console.log('Regenerating server keys...');
const newKeys = regenerateKeyPair();
console.log('New keys generated successfully!');
console.log('Public key (first 50 chars):', newKeys.publicKey.substring(0, 50) + '...'); 