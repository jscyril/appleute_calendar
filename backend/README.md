# Appleute Calendar Backend

The backend server for Appleute Calendar, built with NestJS and TypeScript.

## Tech Stack

- NestJS
- TypeScript
- WebSocket (Socket.io) for real-time notifications
- File upload handling
- In-memory data storage

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The server will be running at `http://localhost:3000`

## Project Structure

```
backend/
├── src/
│   ├── events/           # Event module
│   ├── notifications/    # Notification module
│   ├── uploads/         # File upload handling
│   └── main.ts         # Application entry point
├── test/               # Test files
├── uploads/           # Uploaded files directory
└── package.json       # Dependencies and scripts
```

## API Endpoints

### Events

- `GET /events` - Get all events
- `POST /events` - Create new event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Files

- `POST /uploads` - Upload files (images/videos)
- `GET /uploads/:filename` - Get uploaded file

## WebSocket Events

- `notification` - Real-time event notifications
- `eventUpdated` - Event update notifications
- `eventDeleted` - Event deletion notifications
