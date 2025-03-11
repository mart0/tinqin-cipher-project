import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Book {
    title: string;
    author: string;
    publicationDate: string;
}

const AllBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Fetching books from:', `${API_BASE_URL}/allBooks`);
            const response = await axios.get<Book[]>(`${API_BASE_URL}/allBooks`);
            console.log('Books response:', response.data);
            setBooks(response.data);
        } catch (error: any) {
            console.error('Error fetching books:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                setError(`Failed to load books: ${error.response.status} - ${error.response.data}`);
            } else if (error.request) {
                console.error('Request made but no response received:', error.request);
                setError('Failed to load books: No response from server');
            } else {
                console.error('Error message:', error.message);
                setError(`Failed to load books: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Searching books with query:', query);
            console.log('Search URL:', `${API_BASE_URL}/searchBooks?q=${query}`);
            const response = await axios.get<Book[]>(`${API_BASE_URL}/searchBooks?q=${query}`);
            console.log('Search response:', response.data);
            setBooks(response.data);
        } catch (error: any) {
            console.error('Error searching books:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                setError(`Failed to search books: ${error.response.status} - ${error.response.data}`);
            } else if (error.request) {
                console.error('Request made but no response received:', error.request);
                setError('Failed to search books: No response from server');
            } else {
                console.error('Error message:', error.message);
                setError(`Failed to search books: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="books-container">
            <h2>Book List</h2>

            <div className="search-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search books"
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
                <button onClick={fetchBooks} disabled={loading}>
                    Show All
                </button>
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
                            <p>Published: {book.publicationDate}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AllBooks;