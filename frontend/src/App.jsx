import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import NavBar from "./components/NavBar.jsx";
import { SocketProvider } from "./context/SocketContext";

// Lazy load pages for performance optimization
const Home = lazy(() => import("./pages/Home.jsx"));
const ProjectAssistant = lazy(
  () => import("./pages/ProjectAssistant/ProjectAssistant.jsx"),
);
const Practice = lazy(() => import("./pages/Practise"));
const Stackly = lazy(() => import("./pages/Stackly"));
const ResultStats = lazy(() => import("./pages/ResultStats.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={!isHome ? "pt-24 min-h-screen bg-slate-50" : ""}>
      {children}
    </div>
  );
};

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <SocketProvider>
          <PageWrapper>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/ProjectAssistant"
                  element={<ProjectAssistant />}
                />
                <Route path="/practice" element={<Practice />} />
                <Route path="/practise" element={<Practice />} />
                <Route path="/stackly" element={<Stackly />} />
                <Route path="/results" element={<ResultStats />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Suspense>
          </PageWrapper>
        </SocketProvider>
      </BrowserRouter>
    </div>
  );
}
