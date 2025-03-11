import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AddBook: React.FC = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publicationDate, setPublicationDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('');

    // Test the server connection on component mount
    useEffect(() => {
        const testServer = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/_healthcheck`);
                setServerStatus(`Server connection successful: ${response.data}`);
                console.log('Server test successful:', response.data);
            } catch (error) {
                setServerStatus('Server connection failed');
                console.error('Server test failed:', error);
            }
        };

        testServer();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setError('');

        try {
            const book = { title, author, publicationDate };
            console.log('Submitting book:', book);
            console.log('API URL:', `${API_BASE_URL}/addBook`);

            const response = await axios.post(`${API_BASE_URL}/addBook`, book);
            console.log('Response:', response);

            setMessage('Book added successfully!');
            // Clear form
            setTitle('');
            setAuthor('');
            setPublicationDate('');
        } catch (error: any) {
            console.error('Error adding book:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
                setError(`Failed to add book: ${error.response.status} - ${error.response.data}`);
            } else if (error.request) {
                console.error('Request made but no response received:', error.request);
                setError('Failed to add book: No response from server');
            } else {
                console.error('Error message:', error.message);
                setError(`Failed to add book: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-book-container">
            <h2>Add New Book</h2>
            {serverStatus && <div className="server-status">{serverStatus}</div>}
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter book title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <input
                        id="author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Enter author name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="publicationDate">Publication Date</label>
                    <input
                        id="publicationDate"
                        type="date"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Book'}
                </button>
            </form>
        </div>
    );
};

export default AddBook;