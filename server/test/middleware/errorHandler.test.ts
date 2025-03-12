import { errorHandler } from '../../src/middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler middleware', () => {
    it('should log the error and return a 500 response with a message', () => {
        // Mock console.error to prevent actual console output
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Create mock objects for req, res, and next
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        const next = jest.fn() as NextFunction;

        // Mock error
        const error = new Error('Test error');

        // Call the middleware function
        errorHandler(error, req, res, next);

        // Assertions
        expect(consoleSpy).toHaveBeenCalledWith(error.stack);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Something broke!');
        expect(next).not.toHaveBeenCalled(); // Ensure next() is NOT called

        // Restore console to prevent memory leak
        consoleSpy.mockRestore();
    });
});
