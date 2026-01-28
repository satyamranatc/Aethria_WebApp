# 🚀 Aethria WebApp

A modern, full-stack web application built for seamless project management and code collaboration. This project leverages the power of **React 18** and **Vite** for a lightning-fast frontend, coupled with a robust **Node.js/Express** backend and **MongoDB**.

## 🏗️ Architecture

The project is structured as a monorepo containing both client and server code:

- **Frontend (`/frontend`)**: React Single Page Application (SPA) using Vite, Tailwind CSS, and various UI libraries.
- **Backend (`/backend`)**: Express.js REST API with Socket.io for real-time features and MongoDB for data persistence.

## 🛠️ Tech Stack

### Frontend

- **Core**: React 18, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State/Routing**: React Router DOM (v7)
- **Editor**: CodeMirror / Monaco Editor
- **Real-time**: Socket.io Client
- **Auth**: Clerk & Google OAuth

### Backend

- **Server**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: Helmet, Express Rate Limit, CORS
- **AI Integration**: Google GenAI
- **Real-time**: Socket.io

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Connection URI
- Google Gemini API Key

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5500
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_ai_api_key
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 🔒 Security Features

- **Helmet**: Secures HTTP headers to protect against common vulnerabilities.
- **Rate Limiting**: Limits repeated requests to public APIs to prevent brute-force attacks.
- **CORS Policy**: Restrictive cross-origin resource sharing configuration.

## ⚡ Performance

- **Lazy Loading**: Route-based code splitting using `React.lazy` and `Suspense` ensures fast underlying load times.
- **Vite**: Ultra-fast build tool and dev server.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
