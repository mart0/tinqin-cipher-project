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
                    data: encryptedData,
                    clientPublicKey: clientKeys.publicKey
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Received response:', result);

            // Check if the response is encrypted
            if (result.data) {
                console.log('Received encrypted response, decrypting with client private key');
                try {
                    const decryptedData = decrypt(result.data, clientKeys.privateKey);
                    console.log('Decryption successful:', decryptedData);
                    setMessage(decryptedData);
                } catch (decryptError) {
                    console.error('Failed to decrypt response:', decryptError);
                    setError('Failed to decrypt server response. Please try again.');
                    setMessage('Book added, but could not decrypt server message.');
                }
            } else {
                // Handle unencrypted response
                console.log('Received unencrypted response');
                setMessage('Book added successfully');
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