import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/useApp';

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/admin/modern', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
        </svg>
      )
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      path: '/admin/modern/analytics', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'applicants', 
      label: 'Applicants', 
      path: '/admin/modern/applicants', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 01-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: 'feedback', 
      label: 'Feedback', 
      path: '/admin/modern/feedback', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    { 
      id: 'email', 
      label: 'Email', 
      path: '/admin/modern/email', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-0 lg:w-64 lg:transition-none`}>
        <div className="flex flex-col h-full">
          {/* Company Branding */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-bold text-lg">EA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Elite Associate</h1>
                <p className="text-xs text-blue-100">Admin Panel</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-gray-700 text-gray-400 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 rounded-lg hover:bg-red-900/30 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-gray-700 group-hover:bg-red-600 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10 sticky top-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h1 className="text-xl font-semibold text-gray-900 capitalize">
                {location.pathname.includes('/admin/modern') && location.pathname.split('/').pop() !== 'modern' 
                  ? location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)
                  : 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-lg">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sidebar;