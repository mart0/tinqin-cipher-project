import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { KeyPair } from '../utils/crypto';
import { getOrCreateClientKeys, regenerateClientKeys } from '../services/keyService';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface KeyContextType {
  clientKeys: KeyPair | null;
  serverPublicKey: string | null;
  isLoading: boolean;
  error: string | null;
  regenerateKeys: () => void;
}

const KeyContext = createContext<KeyContextType>({
  clientKeys: null,
  serverPublicKey: null,
  isLoading: true,
  error: null,
  regenerateKeys: () => {}
});

export const useKeys = () => useContext(KeyContext);

interface KeyProviderProps {
  children: ReactNode;
}

export const KeyProvider: React.FC<KeyProviderProps> = ({ children }) => {
  const [clientKeys, setClientKeys] = useState<KeyPair | null>(null);
  const [serverPublicKey, setServerPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize keys on component mount
  useEffect(() => {
    const initializeKeys = async () => {
      try {
        // Get or create client keys
        const keys = getOrCreateClientKeys();
        setClientKeys(keys);
        
        // Fetch server's public key
        const response = await axios.get(`${API_BASE_URL}/publicKey`);
        setServerPublicKey(response.data.publicKey);
      } catch (err) {
        console.error('Error initializing keys:', err);
        setError('Failed to initialize encryption keys');
      } finally {
        setIsLoading(false);
      }
    };

    initializeKeys();
  }, []);

  // Function to regenerate client keys
  const regenerateKeys = () => {
    try {
      const newKeys = regenerateClientKeys();
      setClientKeys(newKeys);
    } catch (err) {
      console.error('Error regenerating keys:', err);
      setError('Failed to regenerate encryption keys');
    }
  };

  return (
    <KeyContext.Provider
      value={{
        clientKeys,
        serverPublicKey,
        isLoading,
        error,
        regenerateKeys
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}; 