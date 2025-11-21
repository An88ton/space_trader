# Space Trader

A full-stack application built with NestJS (backend) and React.js (frontend).

## Project Structure

```
space_trader/
├── backend/          # NestJS backend API
├── frontend/         # React.js frontend application
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup (NestJS)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup (React.js)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Available Scripts

### Backend (NestJS)

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Frontend (React.js)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development

The backend API is configured to accept requests from the React frontend running on `http://localhost:5173` (Vite's default port).

## License

UNLICENSED
