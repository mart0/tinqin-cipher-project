import React, { useState } from 'react';
import { useKeys } from '../contexts/KeyContext';
import { encrypt, decrypt } from '../utils/crypto';
import { API_BASE_URL } from '../config';
import '../styles/AddBook.css';

interface BookFormData {
    title: string;
    author: string;
    year: string;
}

const AddBook: React.FC = () => {
    const [formData, setFormData] = useState<BookFormData>({
        title: '',
        author: '',
        year: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { clientKeys, serverPublicKey, isLoading } = useKeys();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if keys are loaded
        if (isLoading || !clientKeys || !serverPublicKey) {
            setError('Encryption keys are not available. Please wait or refresh the page.');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            // Convert year to number
            const bookData = {
                ...formData,
                year: parseInt(formData.year, 10)
            };

            console.log('Submitting book data:', bookData);

            // Encrypt the book data with server's public key
            const encryptedData = encrypt(JSON.stringify(bookData), serverPublicKey);
            console.log('Data encrypted with server public key');

            // Send encrypted data to server along with client's public key
            const response = await fetch(`${API_BASE_URL}/addBook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    encryptedData,
                    clientPublicKey: clientKeys.publicKey
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            debugger
            const result = await response.json();
            console.log('Received response:', result);

            // Check if the response is encoded
            if (result.encryptedData) {
                console.log('Received encoded response, decoding with client private key');
                try {
                    const decryptedData = decrypt(result.encryptedData, clientKeys.privateKey);
                    console.log('Decoding successful:', decryptedData);

                    // Try to parse the decoded data
                    try {
                        const parsedData = JSON.parse(decryptedData);
                        setMessage(parsedData.message || 'Book added successfully');
                    } catch (parseError) {
                        // If parsing fails, just use the decoded string
                        setMessage(decryptedData);
                    }
                } catch (decryptError) {
                    console.error('Failed to decode response:', decryptError);
                    setError('Failed to decode server response. Please try again.');
                    setMessage('Book added, but could not decode server message.');
                }
            } else {
                // Handle unencoded response
                console.log('Received unencoded response');
                setMessage(result.message || 'Book added successfully');
            }

            // Clear form after successful submission
            setFormData({
                title: '',
                author: '',
                year: ''
            });
        } catch (err) {
            console.error('Error adding book:', err);
            setError('Failed to add book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-book-container">
            <h1>Add New Book</h1>

            <form onSubmit={handleSubmit} className="book-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        disabled={loading || isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                        disabled={loading || isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="year">Publication Year</label>
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        min="1000"
                        max={new Date().getFullYear()}
                        disabled={loading || isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || isLoading || !clientKeys || !serverPublicKey}
                >
                    {loading ? 'Adding Book...' : 'Add Book'}
                </button>
            </form>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default AddBook;