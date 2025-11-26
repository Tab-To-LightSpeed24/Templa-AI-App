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

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    await signOut(auth);

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
