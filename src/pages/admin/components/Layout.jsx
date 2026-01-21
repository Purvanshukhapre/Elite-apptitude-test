import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/useApp';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin/modern', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/admin/modern/analytics', label: 'Analytics', icon: '📈', gradient: 'from-purple-500 to-pink-500' },
    { path: '/admin/modern/applicants', label: 'Applicants', icon: '👥', gradient: 'from-green-500 to-emerald-500' },
    { path: '/admin/modern/feedback', label: 'Feedback', icon: '💬', gradient: 'from-orange-500 to-red-500' },
    { path: '/admin/modern/email', label: 'Email', icon: '✉️', gradient: 'from-indigo-500 to-blue-500' },
  ];

  const isActive = (path) => location.pathname === path || (path === '/admin/modern' && location.pathname === '/admin/modern');

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };



  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">EA</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Elite Associate</div>
              <div className="text-slate-400 text-xs">Admin Portal</div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center px-4 py-3 text-slate-300 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split(' ')[1].split('-')[1]}-500/50`
                      : 'hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  )}
                  <span className="mr-3 text-xl relative z-10">{item.icon}</span>
                  <span className="font-medium relative z-10">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full px-4 py-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 h-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center px-6 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                {/* Removed duplicate page title and welcome message to avoid duplication with individual page headers */}
              </div>
            </div>

            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
