# Appleute Calendar

A modern calendar application built with Next.js and NestJS, featuring event management with image/video attachments and smart notifications.

## Features

- Create, edit, and delete events
- Attach images and videos to events
- Smart notification system
- Event filtering (today, this week, this month, with images, with videos)
- Search functionality

## Project Structure

```
appleute_calendar/
├── frontend/     # Next.js frontend application
└── backend/      # NestJS backend application
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/appleute_calendar.git
cd appleute_calendar
```

2. Set up the backend:

```bash
cd backend
npm install
npm start
```

3. Set up the frontend:

```bash
cd ../frontend
npm install
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

For detailed setup instructions for each part of the application, please refer to:

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Development

To run both frontend and backend in development mode:

1. Start the backend server:

```bash
cd backend
npm start
```

2. In a new terminal, start the frontend development server:

```bash
cd frontend
npm run dev
```
