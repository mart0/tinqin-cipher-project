import express from 'express';
import { addBook, searchBooks, getAllBooks } from '../models/book';
import { encrypt, decrypt } from '../utils/crypto';

const router = express.Router();

// Log when routes are registered
console.log('Registering book routes...');

// Version with encryption
router.post('/addBook', (req, res) => {
    console.log('POST /addBook route hit');
    try {
        // Check if we have encrypted data
        if (req.body.data && req.body.clientPublicKey) {
            console.log('Received encrypted data with client public key');

            // Get the server's private key from app.locals
            const privateKey = req.app.locals.keys?.privateKey;
            if (!privateKey) {
                throw new Error('Server private key not available');
            }

            // Decrypt the data using the server's private key
            const encryptedData = req.body.data;
            const decryptedData = decrypt(encryptedData, privateKey);
            const book = JSON.parse(decryptedData);

            console.log('Decrypted book data:', book);
            addBook(book);

            // Encrypt the response using the client's public key
            const clientPublicKey = req.body.clientPublicKey;
            console.log('Encrypting response with client public key:', clientPublicKey.substring(0, 20) + '...');
            const responseData = encrypt('Book added successfully', clientPublicKey);

            console.log('Book added successfully');
            res.status(201).json({ data: responseData });
        } else {
            // Fallback for non-encrypted requests
            console.log('Received non-encrypted book data:', req.body);
            const book = req.body;
            addBook(book);
            console.log('Book added successfully');
            res.status(201).send('Book added');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).send('Error adding book');
    }
});

router.get('/allBooks', (req, res) => {
    console.log('GET /allBooks route hit');
    try {
        const books = getAllBooks();
        console.log('Returning books:', books);

        // Check if client sent its public key for encrypted response
        const clientPublicKey = req.headers['x-client-public-key'] as string;
        if (clientPublicKey) {
            console.log('Encrypting response with client public key:', clientPublicKey.substring(0, 20) + '...');
            const booksJson = JSON.stringify(books);
            const encryptedData = encrypt(booksJson, clientPublicKey);
            console.log('Response encrypted successfully');
            res.status(200).json({ data: encryptedData });
        } else {
            // Send unencrypted response
            res.status(200).json(books);
        }
    } catch (error) {
        console.error('Error getting books:', error);
        res.status(500).send('Error getting books');
    }
});

router.get('/searchBooks', (req, res) => {
    console.log('GET /searchBooks route hit');
    try {
        const query = req.query.q as string || '';
        console.log('Search query:', query);

        // If query is empty, return all books
        const books = query.trim() === ''
            ? getAllBooks()
            : searchBooks(query);

        console.log('Search results:', books);

        // Check if client sent its public key for encrypted response
        const clientPublicKey = req.headers['x-client-public-key'] as string;
        if (clientPublicKey) {
            console.log('Encrypting response with client public key:', clientPublicKey.substring(0, 20) + '...');
            const booksJson = JSON.stringify(books);
            const encryptedData = encrypt(booksJson, clientPublicKey);
            console.log('Response encrypted successfully');
            res.status(200).json({ data: encryptedData });
        } else {
            // Send unencrypted response
            res.status(200).json(books);
        }
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).send('Error searching books');
    }
});

console.log('Book routes registered');

export default router;