import { generateKeyPair, isServerKey, isClientKey, encrypt, decrypt } from '../../src/utils/crypto';
import crypto from 'crypto';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('crypto test suite', () => {
    describe('generateKeyPair function', () => {
        it('should generate a valid key pair with a public and private key', () => {
            const keyPair = generateKeyPair();

            // Ensure keys exist and are strings
            expect(keyPair).toHaveProperty('publicKey');
            expect(keyPair).toHaveProperty('privateKey');
            expect(typeof keyPair.publicKey).toBe('string');
            expect(typeof keyPair.privateKey).toBe('string');

            // Ensure private key is 64 hex characters (32 bytes in hex)
            expect(keyPair.privateKey).toMatch(/^[a-f0-9]{64}$/i);

            // Ensure public key is 64 hex characters (SHA-256 hash length)
            expect(keyPair.publicKey).toMatch(/^[a-f0-9]{64}$/i);
        });

        it('should derive the correct public key from the private key', () => {
            const keyPair = generateKeyPair();

            // Recompute the public key using the same method
            const expectedPublicKey = crypto.createHash('sha256').update(keyPair.privateKey).digest('hex');

            expect(keyPair.publicKey).toBe(expectedPublicKey);
        });

        it('should generate unique key pairs on each call', () => {
            const keyPair1 = generateKeyPair();
            const keyPair2 = generateKeyPair();

            // Ensure different private keys
            expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);

            // Ensure different public keys
            expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
        });
    });

    describe('isServerKey function', () => {
        it('should return true for a valid server key format', () => {
            const validKey = `-----BEGIN RSA PRIVATE KEY-----
    some-private-key-data
    -----END RSA PRIVATE KEY-----`;

            expect(isServerKey(validKey)).toBe(true);
        });

        it('should return false for a string missing BEGIN keyword', () => {
            const invalidKey = `some-private-key-data
    -----END RSA PRIVATE KEY-----`;

            expect(isServerKey(invalidKey)).toBe(false);
        });

        it('should return false for a completely random string', () => {
            const randomString = 'this is not a key at all';
            expect(isServerKey(randomString)).toBe(false);
        });

        it('should return false for an empty string', () => {
            expect(isServerKey('')).toBe(false);
        });
    });

    describe('isClientKey function', () => {
        it('should return true for a non-server key format', () => {
            // A typical client key (hex string)
            const clientKey = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
            expect(isClientKey(clientKey)).toBe(true);
        });

        it('should return false for a server key format', () => {
            const serverKey = `-----BEGIN RSA PRIVATE KEY-----
    some-private-key-data
    -----END RSA PRIVATE KEY-----`;
            expect(isClientKey(serverKey)).toBe(false);
        });
    });

    describe('encrypt function', () => {
        it('should return a string with signature and encoded data separated by --', () => {
            const data = 'Hello, World!';
            const key = 'test-key';
            const result = encrypt(data, key);

            // Check that the result contains the separator
            expect(result).toContain('--');

            // Split the result into signature and encoded data
            const parts = result.split('--');
            expect(parts.length).toBe(2);

            // Verify the signature is a hex string (SHA-256 hash is 64 hex chars)
            expect(parts[0]).toMatch(/^[a-f0-9]{64}$/i);

            // Verify the encoded data is base64
            const base64Regex = /^[A-Za-z0-9+/=]+$/;
            expect(parts[1]).toMatch(base64Regex);

            // Verify we can decode the base64 part back to the original data
            expect(Buffer.from(parts[1], 'base64').toString()).toBe(data);
        });

        it('should correctly handle object input by converting to JSON string', () => {
            const data = { name: 'Alice', age: 30 };
            const key = 'test-key';
            const result = encrypt(data as unknown as string, key);

            // Split the result
            const parts = result.split('--');
            expect(parts.length).toBe(2);

            // Decode the base64 part and verify it's the JSON string
            const decodedData = Buffer.from(parts[1], 'base64').toString();
            expect(decodedData).toBe(JSON.stringify(data));
        });

        it('should handle encoding errors gracefully', () => {
            // Create a test case where we spy on console.error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            // Create a data object that will be used in the test
            const data = 'Test data';
            const key = 'test-key';

            // Force an error in the encrypt function by spying on HmacSHA256
            const hmacSpy = jest.spyOn(crypto, 'createHmac').mockImplementation(() => {
                throw new Error('Test error');
            });

            try {
                // This should trigger the catch block in the encrypt function
                const result = encrypt(data, key);

                // Verify we get a base64 string back (the fallback)
                expect(typeof result).toBe('string');
                expect(result.length).toBeGreaterThan(0);

                // Verify console.error was called
                expect(consoleSpy).toHaveBeenCalled();
            } finally {
                // Restore the original implementations
                consoleSpy.mockRestore();
                hmacSpy.mockRestore();
            }
        });
    });

    describe('decrypt function', () => {
        // Spy on console logs to avoid cluttering test output
        beforeEach(() => {
            jest.spyOn(console, 'log').mockImplementation(() => { });
            jest.spyOn(console, 'warn').mockImplementation(() => { });
            jest.spyOn(console, 'error').mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should correctly decrypt data that was encrypted with the same key', () => {
            // Arrange
            const originalData = 'Hello, World!';
            const key = 'test-key';
            const encrypted = encrypt(originalData, key);

            // Act
            const decrypted = decrypt(encrypted, key);

            // Assert
            expect(decrypted).toBe(originalData);
        });

        it('should handle data without separator by using direct base64 decode', () => {
            // Arrange
            const originalData = 'Test data without separator';
            const base64Data = Buffer.from(originalData).toString('base64');

            // Act
            const decrypted = decrypt(base64Data, 'any-key');

            // Assert
            expect(decrypted).toBe(originalData);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Data does not contain separator'));
        });

        it('should handle invalid format with more than one separator', () => {
            // Arrange
            const invalidData = 'part1--part2--part3';

            // Act
            const result = decrypt(invalidData, 'any-key');

            // Assert
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Invalid format'));
            // Since we can't predict the exact result (depends on base64 decoding of invalid data),
            // we just check that it returns a string
            expect(typeof result).toBe('string');
        });

        it('should warn but still return data when signature verification fails', () => {
            // Arrange - create data with a signature that won't match when verified
            const originalData = 'Test data for signature verification';
            const key1 = 'key-for-encryption';
            const key2 = 'different-key-for-decryption';

            // Encrypt with key1
            const encrypted = encrypt(originalData, key1);

            // Act - decrypt with key2 (different key)
            const decrypted = decrypt(encrypted, key2);

            // Assert
            expect(decrypted).toBe(originalData); // Data should still be decrypted
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Signature verification failed'));
        });

        it('should return the original data if all decoding attempts fail', () => {
            // Arrange
            // Mock Buffer.from to always throw an error
            const originalBufferFrom = Buffer.from;
            // @ts-expect-error - Mocking for test purposes
            Buffer.from = jest.fn().mockImplementation(() => {
                throw new Error('Simulated Buffer.from error');
            });

            const invalidData = 'not-valid-base64-data';

            // Act
            const result = decrypt(invalidData, 'any-key');

            // Assert
            // Just check that the original data is returned
            expect(result).toBe(invalidData);

            // Clean up
            // @ts-expect-error - Restoring original function
            Buffer.from = originalBufferFrom;
        });

        it('should correctly decrypt JSON data', () => {
            // Arrange
            const originalData = { name: 'Alice', age: 30, isActive: true };
            const key = 'test-key';
            const encrypted = encrypt(JSON.stringify(originalData), key);

            // Act
            const decrypted = decrypt(encrypted, key);

            // Assert
            expect(JSON.parse(decrypted)).toEqual(originalData);
        });
    });
});
