import React from 'react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Background abstract technology elements */}
      <div className="absolute inset-0 opacity-10">
        {/* Faint dashboard panels */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-blue-300 rounded-xl rotate-12"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 border border-blue-400 rounded-lg -rotate-6"></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 border border-blue-300 rounded-xl -rotate-12"></div>
        
        {/* Faint data lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-300 opacity-20"></div>
        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-blue-400 opacity-15"></div>
        <div className="absolute top-2/3 left-0 w-full h-0.5 bg-blue-400 opacity-15"></div>
        
        {/* Faint chart elements */}
        <div className="absolute top-1/5 right-1/5 w-32 h-20 border-l-2 border-b-2 border-blue-300 opacity-20"></div>
        <div className="absolute bottom-1/5 left-1/5 w-40 h-24 border-l-2 border-b-2 border-blue-300 opacity-20"></div>
      </div>

      {/* Wave shapes at bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-24 text-blue-800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-current"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-current"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-current"
          ></path>
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Company logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
          Elite Aptitude Assessment Platform
        </h1>

        {/* Subheadline */}
        <h2 className="text-xl md:text-2xl text-blue-100 mb-4 max-w-2xl leading-relaxed">
          Advanced online testing and training solutions for professional development
        </h2>

        {/* Supporting tagline */}
        <p className="text-lg text-blue-200 mb-10 max-w-3xl leading-relaxed">
          Comprehensive assessment tools designed to evaluate skills, knowledge, and potential with precision and reliability
        </p>

        {/* Primary call-to-action button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
          Get Started Today
        </button>
      </div>
    </div>
  );
};

export default Landing;