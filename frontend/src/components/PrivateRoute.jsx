import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    // const isAuthenticated = localStorage.getItem("token"); // real check
    const isAuthenticated = true; // testing

    return isAuthenticated ? children : <Navigate to="/profile" replace />;
}
