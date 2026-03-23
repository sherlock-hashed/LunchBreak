# CSClash — 1v1 CS Quiz Battles

A real-time competitive 1v1 quiz platform for CS fundamentals, built for SWE placement preparation.

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Socket.io Client  
**Backend:** Node.js, Express, MongoDB, Socket.io, JWT Auth  

## Features

- **Live 1v1 Battles** — Real-time quiz matches powered by WebSockets
- **Multiple Modes** — Blitz (60s MCQ), Rapid (90s Case-Based), Training (solo)
- **Custom Rooms** — Create private rooms and invite friends via room code
- **ELO Rating System** — Skill-based matchmaking with separate ratings per mode
- **Placement-Focused** — DSA, OS, DBMS, CN, OOPs questions
- **Bot Opponents** — ELO-adaptive bots for when no opponents are available
- **Match History & Analytics** — Detailed post-match analysis and skill radar

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account (or local MongoDB)

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd code-clash-arena

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Create .env file in root with:
# PORT=5000
# NODE_ENV=development
# JWT_SECRET=your_jwt_secret
# DATABASE_URL=your_mongodb_connection_string

# Start backend
cd server
node index.js

# Start frontend (in another terminal)
npm run dev
```

The frontend runs on `http://localhost:8080` and the backend on `http://localhost:5000`.

## Project Structure

```
├── src/                  # Frontend (React + TypeScript)
│   ├── components/       # Reusable UI components
│   ├── contexts/         # Auth & Socket context providers
│   ├── pages/            # Route pages
│   └── services/         # API client
├── server/               # Backend (Node.js + Express)
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose schemas
│   ├── services/         # Game engine, matchmaking, bots
│   ├── socket/           # Socket.io event handler
│   ├── middleware/        # JWT auth middleware
│   └── routes/           # Express routes
└── index.html            # Entry point
```
