import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClerkProvider } from "@clerk/clerk-react";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <App />
    </ClerkProvider>
)
