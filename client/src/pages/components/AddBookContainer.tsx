import React, { useState } from 'react';
import { useKeys } from '../../utils/KeyContext';
import { encrypt, decrypt } from '../../utils/crypto';
import { API_BASE_URL } from '../../config';
import AddBookForm from './AddBookForm';

interface BookFormData {
    title: string;
    author: string;
    year: string;
}

interface BookDataPayload {
    title: string;
    author: string;
    year: number;
}

interface AddBookContainerProps {
    onSuccess?: (message: string) => void;
    onError?: (error: string) => void;
}

const AddBookContainer: React.FC<AddBookContainerProps> = ({ onSuccess, onError }) => {
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

    // Check if encryption keys are available
    const validateKeys = (): boolean => {
        if (isLoading || !clientKeys || !serverPublicKey) {
            const errorMsg = 'Encryption keys are not available. Please wait or refresh the page.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return false;
        }
        return true;
    };

    // Prepare book data for submission
    const prepareBookData = (): BookDataPayload => {
        return {
            ...formData,
            year: parseInt(formData.year, 10)
        };
    };

    // Send encrypted data to the server
    const sendEncryptedData = async (bookData: BookDataPayload): Promise<Response> => {
        if (!serverPublicKey || !clientKeys) {
            throw new Error('Encryption keys not available');
        }

        const encryptedData = encrypt(JSON.stringify(bookData), serverPublicKey);
        console.log('Data encrypted with server public key');

        return fetch(`${API_BASE_URL}/addBook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encryptedData,
                clientPublicKey: clientKeys.publicKey
            })
        });
    };

    // Process the server response
    const processResponse = async (response: Response): Promise<string> => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Received response:', result);

        if (!result.encryptedData) {
            // Handle unencoded response
            console.log('Received unencoded response');
            return result.message || 'Book added successfully';
        }

        // Handle encoded response
        return decodeServerResponse(result.encryptedData);
    };

    // Decode the encrypted server response
    const decodeServerResponse = (encryptedData: string): string => {
        if (!clientKeys) {
            throw new Error('Client keys not available');
        }

        console.log('Received encoded response, decoding with client private key');
        try {
            const decryptedData = decrypt(encryptedData, clientKeys.privateKey);
            console.log('Decoding successful:', decryptedData);

            // Try to parse the decoded data
            try {
                const parsedData = JSON.parse(decryptedData);
                return parsedData.message || 'Book added successfully';
            } catch (parseError) {
                // If parsing fails, just use the decoded string
                return decryptedData;
            }
        } catch (decryptError) {
            console.error('Failed to decode response:', decryptError);
            const errorMsg = 'Failed to decode server response. Please try again.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
            return 'Book added, but could not decode server message.';
        }
    };

    // Reset form after successful submission
    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            year: ''
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate keys
        if (!validateKeys()) {
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            // Prepare data
            const bookData = prepareBookData();
            console.log('Submitting book data:', bookData);

            // Send data
            const response = await sendEncryptedData(bookData);

            // Process response
            const successMessage = await processResponse(response);

            // Update UI
            setMessage(successMessage);
            if (onSuccess) onSuccess(successMessage);

            // Reset form
            resetForm();
        } catch (err) {
            console.error('Error adding book:', err);
            const errorMsg = 'Failed to add book. Please try again.';
            setError(errorMsg);
            if (onError) onError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AddBookForm
                formData={formData}
                loading={loading}
                isLoading={isLoading}
                clientKeys={clientKeys}
                serverPublicKey={serverPublicKey}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
        </>
    );
};

export default AddBookContainer; 