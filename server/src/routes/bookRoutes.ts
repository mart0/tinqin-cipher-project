import express from 'express';
import { addBook, searchBooks, getAllBooks } from '../models/book';
import { encrypt, decrypt } from '../utils/crypto';

const router = express.Router();

// Log when routes are registered
console.log('Registering book routes...');

// Version with encryption
router.post('/addBook', async (req, res) => {
    try {
        let bookData;

        // Check if the request contains encrypted data
        if (req.body.encryptedData && req.body.clientPublicKey) {
            console.log('Received encoded book data');
            try {
                // Decode the data using the server's private key
                const decryptedData = decrypt(req.body.encryptedData, req.app.locals.keys?.privateKey);
                bookData = JSON.parse(decryptedData);
                console.log('Successfully decoded book data');
            } catch (error) {
                const decryptError = error instanceof Error ? error : new Error(String(error));
                console.error('Failed to decode book data:', decryptError);
                return res.status(400).json({ error: 'Failed to decode data', details: decryptError.message });
            }
        } else {
            console.log('Received unencoded book data');
            bookData = req.body;
        }

        console.log('Book data to add:', bookData);

        // Add the book to our collection
        addBook(bookData);

        // Prepare response
        const responseData = { message: 'Book added successfully', book: bookData };

        // Check if we should encode the response
        if (req.body.clientPublicKey) {
            try {
                const encodedResponse = encrypt(JSON.stringify(responseData), req.body.clientPublicKey);
                return res.json({ encryptedData: encodedResponse });
            } catch (error) {
                const encryptError = error instanceof Error ? error : new Error(String(error));
                console.error('Failed to encode response:', encryptError);
                // Fall back to unencoded response
                return res.json(responseData);
            }
        }

        return res.json(responseData);
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error adding book:', err);
        res.status(500).json({ error: 'Failed to add book', details: err.message });
    }
});

router.get('/allBooks', (req, res) => {
    console.log('GET /allBooks route hit');
    try {
        const books = getAllBooks();
        console.log('Returning books:', books);

        // Check if client sent its public key for encoded response
        const clientPublicKey = req.headers['x-client-public-key'] as string;
        if (clientPublicKey) {
            console.log('Encoding response with client public key');
            try {
                const booksJson = JSON.stringify(books);
                const encodedData = encrypt(booksJson, clientPublicKey);
                console.log('Response encoded successfully');
                res.status(200).json({ encryptedData: encodedData });
            } catch (error) {
                const encryptError = error instanceof Error ? error : new Error(String(error));
                console.error('Failed to encode response:', encryptError);
                // Fall back to unencoded response
                res.status(200).json(books);
            }
        } else {
            // Send unencoded response
            res.status(200).json(books);
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error getting books:', err);
        res.status(500).json({ error: 'Error getting books', details: err.message });
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

        // Check if client sent its public key for encoded response
        const clientPublicKey = req.headers['x-client-public-key'] as string;
        if (clientPublicKey) {
            console.log('Encoding response with client public key');
            try {
                const booksJson = JSON.stringify(books);
                const encodedData = encrypt(booksJson, clientPublicKey);
                console.log('Response encoded successfully');
                res.status(200).json({ encryptedData: encodedData });
            } catch (error) {
                const encryptError = error instanceof Error ? error : new Error(String(error));
                console.error('Failed to encode response:', encryptError);
                // Fall back to unencoded response
                res.status(200).json(books);
            }
        } else {
            // Send unencoded response
            res.status(200).json(books);
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error searching books:', err);
        res.status(500).json({ error: 'Error searching books', details: err.message });
    }
});

console.log('Book routes registered');

export default router;