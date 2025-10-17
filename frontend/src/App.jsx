// PROBLEM: WAP to Add Two Numbers
// HINT: javascript

import React from 'react'

import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import ProjectAssistant from './pages/ProjectAssistant/ProjectAssistant.jsx'
import Practise from './pages/Practise.jsx'
import ResultStats from './pages/ResultStats.jsx'
import Profile from './pages/Profile.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'


export default function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ProjectAssistant" element={<ProjectAssistant />} />
          <Route path="/practise" element={<Practise />} />
          <Route path="/results" element={<ResultStats />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
