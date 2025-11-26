import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LogOut, PlusSquare, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { logoutUser } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleLogout = () => {
    logoutUser();
    onLogout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'New Project', path: '/create', icon: <PlusSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-dark-950 text-slate-200 font-sans overflow-hidden">
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Left Sidebar - Collapsible */}
      <aside 
        className={`bg-dark-900/80 backdrop-blur-md border-r border-dark-800 flex flex-col z-50 sidebar-transition hidden md:flex
        ${isHovered ? 'w-64' : 'w-20'} 
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 border-b border-dark-800 flex items-center h-20">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl shadow-lg shadow-neon-cyan/20 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 mx-auto">T</div>
            <span className={`ml-3 text-xl font-bold text-white tracking-tight overflow-hidden whitespace-nowrap transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Templa
            </span>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-dark-800 text-neon-cyan border border-dark-800 shadow-inner'
                    : 'text-slate-400 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <span className="min-w-[24px] flex justify-center">{item.icon}</span>
              <span className={`ml-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-dark-800/50 rounded-xl border border-dark-800 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <UserIcon size={16} />
            </div>
            <div className={`overflow-hidden transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors whitespace-nowrap"
          >
            <span className="min-w-[24px] flex justify-center"><LogOut size={18} /></span>
            <span className={`ml-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-dark-900 border-b border-dark-800 p-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center text-white font-bold">T</div>
             <span className="text-lg font-bold text-white">Templa</span>
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-white">
             <LogOut size={20} />
           </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};