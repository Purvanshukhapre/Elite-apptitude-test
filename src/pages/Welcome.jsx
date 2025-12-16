import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-2xl">Elite Associate</div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition backdrop-blur-sm"
          >
            Admin Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl w-full text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-slide-up">
              Welcome to Elite Associate
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-2">
              Online Aptitude Test Platform
            </p>
            <p className="text-lg text-blue-200">
              Your Journey to Success Starts Here
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-white">
            <div className="glass-effect rounded-xl p-6 animate-slide-up">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Easy Registration</h3>
              <p className="text-blue-100 text-sm">
                Quick and simple multi-step registration process
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Comprehensive Test</h3>
              <p className="text-blue-100 text-sm">
                30-minute aptitude test with 10 carefully curated questions
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Instant Results</h3>
              <p className="text-blue-100 text-sm">
                Get your test results immediately after completion
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <button
              onClick={() => navigate('/register')}
              className="group px-12 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="flex items-center">
                Start Your Application
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <p className="text-blue-100 text-sm mt-4">
              Scan the QR code or click the button to begin
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="glass-effect rounded-xl p-6 text-left">
              <h4 className="text-white font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                What to Expect
              </h4>
              <ul className="text-blue-100 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Fill out your personal and professional details</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Complete a 30-minute online aptitude test</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provide feedback about your experience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Receive confirmation and next steps</span>
                </li>
              </ul>
            </div>

            <div className="glass-effect rounded-xl p-6 text-left">
              <h4 className="text-white font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                Requirements
              </h4>
              <ul className="text-blue-100 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Valid email address and phone number</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Educational background information</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Resume or portfolio link (optional)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Stable internet connection for the test</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-blue-100 text-sm">
        <p>&copy; 2024 TechCorp. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Welcome;
