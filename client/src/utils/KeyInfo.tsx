import React, { useState } from 'react';
import { useKeys } from './KeyContext';
import '../styles/KeyInfo.css';

const KeyInfo: React.FC = () => {
    const { clientKeys, serverPublicKey, isLoading, error, regenerateKeys } = useKeys();
    const [showKeys, setShowKeys] = useState(false);

    if (isLoading) {
        return <div className="key-info loading">Loading encryption keys...</div>;
    }

    if (error) {
        return <div className="key-info error">{error}</div>;
    }

    const toggleShowKeys = () => {
        setShowKeys(!showKeys);
    };

    const formatKey = (key: string | null) => {
        if (!key) return 'Not available';
        return showKeys ? key : `${key.substring(0, 20)}...`;
    };

    return (
        <div className="key-info">
            <h3>Encryption Keys</h3>
            <div className="key-status">
                <p>
                    <strong>Client Public Key:</strong>{' '}
                    <span className="key-text">{formatKey(clientKeys?.publicKey || null)}</span>
                </p>
                {showKeys && (
                    <p>
                        <strong>Client Private Key:</strong>{' '}
                        <span className="key-text private">{formatKey(clientKeys?.privateKey || null)}</span>
                    </p>
                )}
                <p>
                    <strong>Server Public Key:</strong>{' '}
                    <span className="key-text">{formatKey(serverPublicKey)}</span>
                </p>
            </div>
            <div className="key-actions">
                <button onClick={toggleShowKeys} className="toggle-button">
                    {showKeys ? 'Hide Keys' : 'Show Full Keys'}
                </button>
                <button onClick={regenerateKeys} className="regenerate-button">
                    Regenerate Client Keys
                </button>
            </div>
        </div>
    );
};

export default KeyInfo; 