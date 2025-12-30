import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated } = useApp();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/modern');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const success = adminLogin(credentials.username, credentials.password);
      if (success) {
        navigate('/admin/modern');
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 m-0 p-0 overflow-hidden">
      {/* Animated background elements - lower z-index to ensure they don't interfere with clickable elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blur multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blur multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blur multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="flex items-center justify-center w-full h-full max-w-md px-4 z-10 relative">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-gray-300 text-sm">Elite Associate Recruitment System</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6 transition-all duration-300 relative z-20">
            <h2 className="text-lg font-semibold text-white mb-1 text-center">Welcome Back</h2>
            <p className="text-gray-300 text-center mb-4 text-sm">Sign in to your admin dashboard</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 p-2 rounded-lg flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-200 font-medium text-sm">{error}</span>
                </div>
              )}

              {loading && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    className="w-full pl-8 pr-2 py-2 bg-white/5 border border-white/20 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 text-sm"
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className="w-full pl-8 pr-2 py-2 bg-white/5 border border-white/20 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 text-sm"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-md font-medium text-white transition-all ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/20'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Back to Home - Now positioned outside the card but clearly visible with higher z-index */}
          <div className="mt-6 relative z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="w-full py-2.5 px-4 rounded-md font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;