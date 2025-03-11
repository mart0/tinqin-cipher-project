import app from './app';
import { getOrCreateKeyPair } from './utils/keyStorage';

// Generate or load keys at server startup
const { publicKey, privateKey } = getOrCreateKeyPair();
console.log('Server keys initialized');

// Make keys available to the application
app.locals.keys = { publicKey, privateKey };

// Endpoint to get the server's public key
app.get('/publicKey', (req, res) => {
    console.log('Public key requested');
    res.status(200).send({ publicKey: app.locals.keys.publicKey });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});