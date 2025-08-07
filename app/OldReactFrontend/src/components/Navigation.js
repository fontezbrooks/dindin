import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: '/discover', label: 'Discover', icon: '🌿' },
    { path: '/matches', label: 'Matches', icon: '💕' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-[#F0F4EC] border-b-2 border-[#87A96B] border-opacity-20 z-50 soft-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/discover" className="flex items-center">
                <span className="text-3xl font-bold text-[#87A96B]">DinDin</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'nav-active shadow-lg transform -translate-y-0.5'
                      : 'nav-inactive hover:bg-[#87A96B] hover:bg-opacity-10'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Avatar */}
            <div className="flex items-center">
              <img
                className="h-9 w-9 rounded-full border-2 border-[#87A96B] shadow-sm"
                src={user.avatar || 'https://via.placeholder.com/36/87A96B/FFFFFF?text=U'}
                alt={user.name}
              />
              <span className="ml-3 text-sm font-medium text-[#2C3E35]">{user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F0F4EC] border-t-2 border-[#87A96B] border-opacity-20 z-50 soft-shadow">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-2 transition-all ${
                isActive(item.path)
                  ? 'text-[#87A96B] bg-[#87A96B] bg-opacity-10 rounded-xl mx-1 transform -translate-y-0.5'
                  : 'text-[#6B7B63] hover:text-[#87A96B]'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;