import React, { useState } from 'react';
import { loginUser } from '../services/storageService';
import { auth } from '../services/firebase';

import { User } from '../types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { Button } from '../components/Button';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user: User = {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || name,
        email: userCredential.user.email || '',
      };
      onLogin(user);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-md w-full bg-dark-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-dark-800 overflow-hidden relative z-10">
        <div className="bg-gradient-to-b from-dark-800 to-dark-900 p-8 text-center border-b border-dark-800">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl shadow-neon-cyan flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6">
            T
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to Templa</h1>
          <p className="text-slate-400">AI-Assisted Document Authoring</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan outline-none transition-all placeholder-slate-600"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-dark-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan outline-none transition-all placeholder-slate-600"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full shadow-neon-cyan" size="lg">
              Enter Platform
            </Button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-500 border-t border-dark-800 pt-4">
            <p>Demo Environment • Local Storage Persistence</p>
          </div>
        </div>
      </div>
    </div>
  );
};