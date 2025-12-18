import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRef } from "react";
import logo from "../../assets/elitelogo.png";
import bgImage from "../../assets/web_development.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  const text = "Online Aptitude Test Platform";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const heroRef = useRef(null);


  // Typing Effect
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="absolute inset-0 bg-[#4A70A9]/20" />

      
      {/* Optional dark overlay for better contrast */}
      <div className="absolute inset-0 bg-[#4A70A9]/70" />

      
      {/* Logo (Static) */}
      <nav className="pt-6 md:pt-10 px-4 z-10">
        <div className="flex justify-center items-center">
          <div
            className="p-4 md:p-6 rounded-2xl 
                       bg-white/20 backdrop-blur-lg
                       shadow-1xl ring-1 ring-white/30 "
                       
          >
            <img
              src={logo}
              alt="Elite Associate Logo"
              className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto"
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 relative z-10 pt-2 sm:pt-4 md:pt-0 ">
        <div ref={heroRef} className="max-w-4xl w-full text-center -mt-1 sm:-mt-9 md:mt-0">

          <h1
            className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 md:mb-6 animate-fade-in"
          >
            Welcome to {" "}<span className="bg-gradient-to-r from-blue-200 to-white 
                   bg-clip-text text-transparent">
    Elite Associate
  </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-3xl text-blue-100 font-medium min-h-[2.5rem]">
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-blue-200 mt-3 md:mt-4">
            Your Journey to Success Starts Here 
          </p>
          
          {/* CTA Button */}
          <div className="mt-8 md:mt-10">
            <button
              onClick={() => navigate("/register")}
              className="px-6 sm:px-8 md:px-14 
                         py-2 sm:py-3 md:py-4
                         bg-white text-blue-600 font-bold 
                         text-sm sm:text-base md:text-lg 
                         rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Start Your Application →
            </button>
          
                  
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 md:p-6 text-center text-blue-200 text-xs md:text-sm">
         Elite Associate
      </footer>
    </div>
  );
};

export default Welcome;