# Appleute Calendar Frontend

The frontend application for Appleute Calendar, built with Next.js 14 and TypeScript.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- FullCalendar

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see [backend README](../backend/README.md))

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:](http://localhost:3000)8080 in your browser

## Project Structure

```
frontend/
├── src/
│   ├── app/              # App router pages and layouts
│   │   ├── components/   # React components
│   │   └── page.tsx     # Home page
│   ├── services/         # API services
│   └── styles/          # Global styles
├── public/              # Static files
└── package.json         # Dependencies and scripts
```

## Features

- Modern calendar interface with FullCalendar
- Create, edit, and delete events
- Attach images and videos to events
- Event filtering and search
- Real-time notifications
