import React from 'react';
import { KeyPair } from '../../utils/crypto';

interface AddBookButtonProps {
    loading: boolean;
    isLoading: boolean;
    clientKeys: KeyPair | null;
    serverPublicKey: string | null;
}

const AddBookButton: React.FC<AddBookButtonProps> = ({
    loading,
    isLoading,
    clientKeys,
    serverPublicKey
}) => {
    return (
        <button
            type="submit"
            disabled={loading || isLoading || !clientKeys || !serverPublicKey}
        >
            {loading ? 'Adding Book...' : 'Add Book'}
        </button>
    );
};

export default AddBookButton; 