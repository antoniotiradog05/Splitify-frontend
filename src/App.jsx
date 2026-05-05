import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Group from './pages/Group';
import Summary from './pages/Summary';
import { Toaster } from 'react-hot-toast';
import InstallPWA from './components/InstallPWA';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/group/:code" element={<Group />} />
        <Route path="/group/:code/summary" element={<Summary />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <AnimatedRoutes />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#161920',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '0.9rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }
          }}
        />
        <InstallPWA />
      </div>
    </Router>
  );
}

export default App;
