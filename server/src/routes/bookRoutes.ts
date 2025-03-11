import express from 'express';
import { addBook, searchBooks, getAllBooks } from '../models/book';
import { encrypt, decrypt } from '../utils/crypto';

const router = express.Router();

// Log when routes are registered
console.log('Registering book routes...');

// Simple version without encryption for now
router.post('/addBook', (req, res) => {
    console.log('POST /addBook route hit');
    try {
        console.log('Received book data:', req.body);
        const book = req.body;
        addBook(book);
        console.log('Book added successfully');
        res.status(201).send('Book added');
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
        res.status(200).json(books);
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
        res.status(200).json(books);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).send('Error searching books');
    }
});

console.log('Book routes registered');

export default router;