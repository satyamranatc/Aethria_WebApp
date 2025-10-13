import React from 'react'

import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import CodeAssistant from './pages/CodeAssistant.jsx'
import Practise from './pages/Practise.jsx'
import Profile from './pages/Profile.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute.jsx'

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/codeassistant" element={
            <PrivateRoute>
              <CodeAssistant />
            </PrivateRoute>
          } />
          <Route path="/practise" element={
            <PrivateRoute>
              <Practise />
            </PrivateRoute>
          } />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
