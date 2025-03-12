import * as keyStorage from '../../src/utils/keyStorage';
import fs from 'fs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock fs module
jest.mock('fs');

describe('keyStorage test suite', () => {
    describe('getOrCreateKeyPair function', () => {
        const mockKeyPair = { publicKey: 'mock-public-key', privateKey: 'mock-private-key' };

        beforeEach(() => {
            jest.clearAllMocks();
            // Mock the createAndSaveNewKeyPair function
            jest.spyOn(keyStorage, 'createAndSaveNewKeyPair').mockReturnValue(mockKeyPair);
        });

        it('should load existing keys if the key file exists', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockKeyPair));

            const result = keyStorage.getOrCreateKeyPair();

            expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf8');
            expect(result).toEqual(mockKeyPair);
        });

        it('should generate and save a new key pair if the key file does not exist', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = keyStorage.getOrCreateKeyPair();

            expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
            expect(keyStorage.createAndSaveNewKeyPair).toHaveBeenCalled();
            expect(result).toEqual(mockKeyPair);
        });

        it('should generate a new key pair if an error occurs while reading the file', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('File read error');
            });

            const result = keyStorage.getOrCreateKeyPair();

            expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf8');
            expect(keyStorage.createAndSaveNewKeyPair).toHaveBeenCalled();
            expect(result).toEqual(mockKeyPair);
        });
    });

    describe('createAndSaveNewKeyPair function', () => {
        // Restore the original implementation for these tests
        beforeEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();

            // Mock console methods to avoid cluttering test output
            jest.spyOn(console, 'log').mockImplementation(() => { });
            jest.spyOn(console, 'error').mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should generate a new key pair and save it to a file', () => {
            // Arrange
            const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { });

            // Act
            const result = keyStorage.createAndSaveNewKeyPair();

            // Assert
            expect(result).toBeDefined();
            expect(result.publicKey).toBeDefined();
            expect(result.privateKey).toBeDefined();
            expect(typeof result.publicKey).toBe('string');
            expect(typeof result.privateKey).toBe('string');
            expect(mockWriteFileSync).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('New keys generated and saved to file');
        });

        it('should handle errors when saving to file', () => {
            // Arrange
            const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                throw new Error('Write file error');
            });

            // Act
            const result = keyStorage.createAndSaveNewKeyPair();

            // Assert
            expect(result).toBeDefined();
            expect(result.publicKey).toBeDefined();
            expect(result.privateKey).toBeDefined();
            expect(mockWriteFileSync).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(
                'Failed to save keys to file:',
                expect.any(Error)
            );
        });

        it('should generate unique key pairs on each call', () => {
            // Act
            const result1 = keyStorage.createAndSaveNewKeyPair();
            const result2 = keyStorage.createAndSaveNewKeyPair();

            // Assert
            expect(result1.publicKey).not.toBe(result2.publicKey);
            expect(result1.privateKey).not.toBe(result2.privateKey);
        });
    });

    describe('regenerateKeyPair function', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            // Mock console methods to avoid cluttering test output
            jest.spyOn(console, 'log').mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should log regeneration message and call createAndSaveNewKeyPair', () => {
            // Arrange
            const mockKeyPair = { publicKey: 'new-public-key', privateKey: 'new-private-key' };
            jest.spyOn(keyStorage, 'createAndSaveNewKeyPair').mockReturnValue(mockKeyPair);

            // Act
            const result = keyStorage.regenerateKeyPair();

            // Assert
            expect(console.log).toHaveBeenCalledWith('Regenerating key pair');
            expect(keyStorage.createAndSaveNewKeyPair).toHaveBeenCalled();
            expect(result).toEqual(mockKeyPair);
        });

        it('should return a new key pair', () => {
            // Act
            const result = keyStorage.regenerateKeyPair();

            // Assert
            expect(result).toBeDefined();
            expect(result.publicKey).toBeDefined();
            expect(result.privateKey).toBeDefined();
            expect(typeof result.publicKey).toBe('string');
            expect(typeof result.privateKey).toBe('string');
        });

        it('should return the result from createAndSaveNewKeyPair', () => {
            // Arrange
            const mockKeyPair = { publicKey: 'test-public-key', privateKey: 'test-private-key' };
            jest.spyOn(keyStorage, 'createAndSaveNewKeyPair').mockReturnValue(mockKeyPair);

            // Act
            const result = keyStorage.regenerateKeyPair();

            // Assert
            expect(result).toBe(mockKeyPair); // Using toBe to check for reference equality
        });
    });
});
