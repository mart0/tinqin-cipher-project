import React from 'react';
import { KeyPair } from '../../utils/crypto';

interface AddBookSubmitButtonProps {
    loading: boolean;
    isLoading: boolean;
    clientKeys: KeyPair | null;
    serverPublicKey: string | null;
}

const AddBookSubmitButton: React.FC<AddBookSubmitButtonProps> = ({
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

export default AddBookSubmitButton; 