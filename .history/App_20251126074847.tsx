import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateProject } from './pages/CreateProject';
import { Editor } from './pages/Editor';
import { Auth } from './pages/Auth';
import { getCurrentUser } from './services/storageService';
import { User } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();

  }, []);

  useEffect(() => {
    async function listGeminiModels() {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is not set in your .env.local file.");
        return;
      }
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Available models:', data.models.map(m => m.name));
      } catch (error) {
        console.error('Failed to list models:', error);
      }
    }

    listGeminiModels();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Dashboard user={user} />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/create"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <CreateProject user={user} />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/editor/:id"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Editor />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/auth"
          element={
            !user ? <Auth onLogin={handleLogin} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
