# tinqin-cipher-project

A simple web application that generates and uses two key pairs to cipher basic requests and responses between the client and the server.

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

This will start both the client and server concurrently.

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

## Building for Production

To build both client and server for production:

```bash
npm run build
```

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend server