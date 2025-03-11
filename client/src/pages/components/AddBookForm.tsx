import React from 'react';
import { KeyPair } from '../../utils/crypto';
import AddBookInput from './AddBookInput';
import AddBookSubmitButton from './AddBookSubmitButton';

interface BookFormData {
    title: string;
    author: string;
    year: string;
}

interface AddBookFormProps {
    formData: BookFormData;
    loading: boolean;
    isLoading: boolean;
    clientKeys: KeyPair | null;
    serverPublicKey: string | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({
    formData,
    loading,
    isLoading,
    clientKeys,
    serverPublicKey,
    handleChange,
    handleSubmit
}) => {
    return (
        <form onSubmit={handleSubmit} className="book-form">
            <AddBookInput
                id="title"
                name="title"
                label="Title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading || isLoading}
            />

            <AddBookInput
                id="author"
                name="author"
                label="Author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                required
                disabled={loading || isLoading}
            />

            <AddBookInput
                id="year"
                name="year"
                label="Publication Year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={loading || isLoading}
                min="1000"
                max={new Date().getFullYear()}
            />

            <AddBookSubmitButton
                loading={loading}
                isLoading={isLoading}
                clientKeys={clientKeys}
                serverPublicKey={serverPublicKey}
            />
        </form>
    );
};

export default AddBookForm;