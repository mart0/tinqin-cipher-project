# tinqin-cipher-project

A simple web application that generates and uses two key pairs to cipher basic requests and responses between the client and the server.

## Walkthrough videos

Before we dive into the project setup and installation, I have decided to record the following two Loom videos:

- Project overview & tech challenges - https://www.loom.com/share/9f259ae73b56442c92c97c0f9485e890?sid=7c2b105d-e2c3-4573-b31b-307cf02e0838
- UI overview & explanations - https://www.loom.com/share/ab840b47ffad425086b1fe980ac2f89c?sid=2a2f4e9b-1dbb-4b50-b311-53f192d15a34

I hope they give you better initial perspective of the code and the app in general.

## Setup and Installation

To set up the project, run the following command:

```bash
npm run setup
```

This will install all dependencies for the root project, client, and server.

## Running the Application

You can run the entire application (both client and server) with a single command:

```bash
npm start
```

Note: Please have in mind that running the app with `npm start` may take a couple of seconds mainly for the server to start. Whenever you see `Server is running on port 3000` in the console, you are good to go.

### Development Mode

For development with hot-reloading:

```bash
npm run dev
```

### Running Client or Server Separately

To run only the client:

```bash
npm run client
```

To run only the server:

```bash
npm run server
```

For server with hot-reloading:

```bash
npm run server:dev
```

## Running tests

Currently, there are only a couple of unit tests in the server part. In order to run them, make sure you are inside the **server* folder (`cd server`) and run:
```
npm test
```
![](./docs/unit_tests_cov.png?raw=true "Unit Tests Coverage")

## Building for Production

To build both client and server for production:

```bash
npm run build
```

## Project Structure

### Client (React Frontend)

The client is a React application built with React + TypeScript, providing a user interface for the book management system.

```
client/
├── public/            # Static assets and HTML template
├── src/               # Source code
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React context providers
│   ├── navigation/    # Routing and navigation components
│   ├── pages/         # Page components for different routes
│   ├── services/      # API service integrations
│   ├── styles/        # CSS and styling files
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and helpers
│   ├── App.tsx        # Main application component
│   ├── App.css        # Main application styles
│   ├── config.ts      # Application configuration
│   └── index.tsx      # Application entry point
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

### Server (Express Backend)

The server is an Express.js application with TypeScript + ExpressJS that provides API endpoints and handles data encryption.

```
server/
├── src/               # Source code
│   ├── middleware/    # Express middleware functions
│   ├── models/        # Data models and storage
│   ├── routes/        # API route definitions
│   ├── scripts/       # Utility scripts
│   ├── utils/         # Utility functions including crypto
│   ├── app.ts         # Express application setup
│   └── server.ts      # Server entry point
├── test/              # Test files
├── keys.json          # Encryption  (generated on server start)
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

The application implements end-to-end encryption for secure communication between client and server, with Zod validation ensuring data integrity.

## Server Endpoints

- GET http://localhost:3000/publicKey - returns the public key of the server
- GET http://localhost:3000/allBooks - fetch all inserted books
- POST http://localhost:3000/addBook - insert a book; the format must be `{title: 'Title', author: 'Author', year: '1992'}`
- GET http://localhost:3000/searchBooks - search for a specific book by a give search query
- GET http://localhost:3000/_healthcheck - a simple health check endpoint to check the server is up and running

## Ideas for improvement
- Add more unit tests - for the server and the client part of the app
- Implement automation tests (both API and E2E) using Playwright
- Introduce a proper logging with the help of a convinient library - Pino, Winston, or something else
- Improve the CI/CD of the project
- Dockerize the app
- Introduce an authentication mechanism - a login portal for users to sign-up & sign-in (this will require implementing a DB, of course)
- Introduce some UI improvements - make it more user friendly, improve the UX in general