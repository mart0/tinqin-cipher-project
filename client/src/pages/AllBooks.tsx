import React, { useState, useEffect, useCallback } from 'react';
import { useKeys } from '../contexts/KeyContext';
import { decrypt } from '../utils/crypto';
import { API_BASE_URL } from '../config';
import '../styles/AllBooks.css';

interface Book {
    id: string;
    title: string;
    author: string;
    year: number;
}

const AllBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const { clientKeys, isLoading } = useKeys();

    // Wrap fetchBooks in useCallback to prevent it from changing on every render
    const fetchBooks = useCallback(async () => {
        if (isLoading || !clientKeys) {
            console.log('Keys not loaded yet, cannot fetch books');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Fetching books with client public key for encrypted response');
            const response = await fetch(`${API_BASE_URL}/allBooks`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Public-Key': clientKeys.publicKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Received response:', result);

            // Check if the response is encoded
            if (result.encryptedData) {
                console.log('Received encoded data, decoding with client private key');
                try {
                    const decryptedData = decrypt(result.encryptedData, clientKeys.privateKey);
                    console.log('Decoding successful');
                    if (decryptedData === '') {
                        setBooks([]);
                    } else {
                        const parsedData = JSON.parse(decryptedData);
                        setBooks(parsedData);
                    }
                } catch (decryptError) {
                    console.error('Failed to decode data:', decryptError);
                    setError('Failed to decode the book data. Please try again.');
                }
            } else {
                // Handle unencoded response
                console.log('Received unencoded data');
                setBooks(result);
            }
        } catch (err) {
            console.error('Error fetching books:', err);
            setError('Failed to fetch books. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [clientKeys, isLoading]);

    // Wrap handleSearch in useCallback to prevent it from changing on every render
    const handleSearch = useCallback(async (e: React.FormEvent) => {
        debugger
        e.preventDefault();

        if (isLoading || !clientKeys) {
            console.log('Keys not loaded yet, cannot search books');
            return;
        }

        // Don't search if query is empty - just fetch all books instead
        if (!searchQuery.trim()) {
            console.log('Empty search query, fetching all books instead');
            fetchBooks();
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log(`Searching for books with query: "${searchQuery}"`);
            const response = await fetch(`${API_BASE_URL}/searchBooks?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Public-Key': clientKeys.publicKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Received search response:', result);

            // Check if the response is encoded
            if (result.encryptedData) {
                console.log('Received encoded search results, decoding with client private key');
                try {
                    const decryptedData = decrypt(result.encryptedData, clientKeys.privateKey);
                    console.log('Decoding successful');
                    const parsedData = JSON.parse(decryptedData);
                    setBooks(parsedData);
                } catch (decryptError) {
                    console.error('Failed to decode search results:', decryptError);
                    setError('Failed to decode the search results. Please try again.');
                }
            } else {
                // Handle unencoded search results
                console.log('Received unencoded search results');
                setBooks(result);
            }
        } catch (err) {
            console.error('Error searching books:', err);
            setError('Failed to search books. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [clientKeys, isLoading, searchQuery, fetchBooks]);

    // Effect for debouncing search query
    useEffect(() => {
        // Don't set up debounce if keys aren't loaded
        if (isLoading || !clientKeys) {
            return;
        }

        // Only set up debounce if there's a search query
        if (searchQuery.trim() === '') {
            return;
        }

        console.log('Setting up debounced search for:', searchQuery);
        const timerId = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchQuery, isLoading, clientKeys]);

    // Trigger search when debounced query changes
    useEffect(() => {
        // Don't search if there's no query or keys aren't loaded
        if (!debouncedQuery || isLoading || !clientKeys) {
            return;
        }

        console.log('Executing debounced search for:', debouncedQuery);
        const dummyEvent = { preventDefault: () => { } } as React.FormEvent;
        handleSearch(dummyEvent);
    }, [debouncedQuery, handleSearch, isLoading, clientKeys]);

    // Fetch books when keys are loaded or when search is cleared
    useEffect(() => {
        if (isLoading || !clientKeys) {
            return;
        }

        // If search is cleared, fetch all books
        if (searchQuery === '' && debouncedQuery === '') {
            console.log('Search cleared, fetching all books');
            fetchBooks();
        }
    }, [isLoading, clientKeys, fetchBooks, searchQuery, debouncedQuery]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchQuery(newValue);

        // If search is cleared, immediately reset debounced query
        if (newValue === '') {
            setDebouncedQuery('');
        }
    };

    // Create a dummy event for the search button
    const handleSearchButtonClick = () => {
        if (!searchQuery.trim()) {
            // If search is empty, just fetch all books
            fetchBooks();
            return;
        }

        const dummyEvent = { preventDefault: () => { } } as React.FormEvent;
        handleSearch(dummyEvent);
    };

    return (
        <div className="books-container">
            <h1>All Books</h1>

            <div className="search-container">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="Search books"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={handleSearchButtonClick}
                        disabled={loading || !searchQuery || isLoading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    <button
                        type="button"
                        onClick={fetchBooks}
                        disabled={loading || isLoading}
                    >
                        Show All
                    </button>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <p>Loading books...</p>
            ) : books.length === 0 ? (
                <p>No books found. Add some books to get started!</p>
            ) : (
                <ul className="book-list">
                    {books.map((book, index) => (
                        <li key={index} className="book-item">
                            <h3>{book.title}</h3>
                            <p>Author: {book.author}</p>
                            <p>Published: {book.year}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AllBooks;