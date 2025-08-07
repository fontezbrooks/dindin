import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFC700]"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" />;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {user && <Navigation />}
      <main className={user ? "pt-16 md:pt-20" : ""}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page - standalone layout */}
          <Route path="/" element={<Landing />} />
          
          {/* Protected routes - use AppLayout */}
          <Route 
            path="/discover" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Discover />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matches" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Matches />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;