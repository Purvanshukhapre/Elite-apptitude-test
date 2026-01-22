import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import logo from "../../assets/elitelogo.png";
import polyBg from "../../assets/1397.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useApp();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = adminLogin(credentials.username, credentials.password);
      if (success) {
        // Navigate to different dashboards based on role
        if (credentials.username === 'admin') {
          navigate('/admin/modern');
        } else if (credentials.username === 'hr') {
          navigate('/hr/modern'); // HR dashboard route
        }
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        {/* LOGO */}
        <header className="pt-6 sm:pt-8 w-full max-w-md">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 sm:px-8 sm:py-5 shadow-2xl border border-gray-200">
              <img
                src={logo}
                alt="Elite Associate"
                className="h-12 sm:h-16 md:h-20 w-auto mx-auto"
              />
            </div>
          </div>
        </header>

        {/* LOGIN FORM */}
        <main className="flex-grow flex items-center w-full px-4 mt-8">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                Admin / HR Login
              </h1>
              <p className="text-blue-100 text-base sm:text-lg opacity-90">
                Access your dashboard
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 animate-slide-up shadow-2xl border border-white/30">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-gray-800"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-gray-800"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full bg-sky-500 hover:bg-sky-600
                    text-white font-semibold
                    px-6 py-4
                    rounded-xl
                    shadow-2xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-sky-500/40
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Logging in...' : 'Login to Dashboard'}
                </button>
              </form>

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
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slide-up {
            animation: slide-up 0.6s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;