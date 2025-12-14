// PROBLEM: WAP to Add Two Numbers
// HINT: javascript

import React from "react";

import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import ProjectAssistant from "./pages/ProjectAssistant/ProjectAssistant.jsx";
import Practice from "./pages/Practise";
import Stackly from "./pages/Stackly";
import { SocketProvider } from "./context/SocketContext";
import ResultStats from "./pages/ResultStats.jsx";
import Profile from "./pages/Profile.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ProjectAssistant" element={<ProjectAssistant />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practise" element={<Practice />} />
            <Route path="/stackly" element={<Stackly />} />
            <Route path="/results" element={<ResultStats />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </div>
  );
}
