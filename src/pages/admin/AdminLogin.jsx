import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import logo from '../../assets/elitelogo.png';
import polyBg from '../../assets/1397.jpg';

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
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* ===== ANIMATED LOW-POLY BACKGROUND ===== */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-bgDrift"
        style={{ backgroundImage: `url(${polyBg})` }}
      />

      {/* Soft global overlay (very light) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-blue-800/30" />

      {/* Center focus overlay for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0)_70%)]" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between p-4">
        {/* LOGO */}
        <header className="pt-14 w-full max-w-md">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
              <img
                src={logo}
                alt="Elite Associate"
                className="h-16 w-auto mx-auto"
              />
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center w-full max-w-md mx-auto">
          <div className="w-full max-w-md px-4">
            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Admin Portal</h2>
              <p className="text-gray-600 text-center mb-4">Sign in to your admin dashboard</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-300 p-2 rounded-lg flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 font-medium text-sm">{error}</span>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500"
                      placeholder="Enter your username"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500"
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
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-sky-500 hover:bg-sky-600 shadow-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sky-500/40'
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

            {/* Back to Home */}
            <div className="mt-6 w-full max-w-md">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white transition-all border border-gray-300"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </span>
              </button>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="pb-4 text-blue-200/80 text-sm text-center">
          © {new Date().getFullYear()} Elite Associate — Placement & Training Center
        </footer>
      </div>

      {/* ===== BACKGROUND ANIMATION ===== */}
      <style>
        {`
          @keyframes bgDrift {
            0% {
              transform: scale(1) translate(0, 0);
            }
            50% {
              transform: scale(1.05) translate(-10px, -10px);
            }
            100% {
              transform: scale(1) translate(0, 0);
            }
          }

          .animate-bgDrift {
            animation: bgDrift 30s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;