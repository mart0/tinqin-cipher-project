import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import bookRoutes from './routes/bookRoutes';

// Extend Express application to include our custom properties
declare module 'express' {
    interface Application {
        locals: {
            keys?: {
                publicKey: string;
                privateKey: string;
            };
        }
    }
}

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
}));
app.use(morgan('combined'));

// Test route to verify server is working
app.get('/_healthcheck', (req, res) => {
    console.log('Health check route hit');
    res.status(200).send('Server is working!');
});

// Register routes - use the routes directly without the /api prefix
app.use(bookRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;