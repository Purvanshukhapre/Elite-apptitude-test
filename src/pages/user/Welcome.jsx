import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/elitelogo.png";
import polyBg from "../../assets/1397.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  const text = "Online Aptitude Test Platform";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 55);
      return () => clearTimeout(timer);
    }
  }, [index, text]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">

      {/* ===== ANIMATED LOW-POLY BACKGROUND ===== */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-bgDrift"
        style={{ backgroundImage: `url(${polyBg})` }}
      />

      {/* Soft global overlay (very light) */}
      <div className="absolute inset-0 bg-blue-900/20" />

      {/* Center focus overlay for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.15)_35%,rgba(0,0,0,0)_65%)]" />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between">

        {/* LOGO */}
        <header className="pt-14">
          <div className="bg-white rounded-2xl px-12 py-7 shadow-xl">
            <img
              src={logo}
              alt="Elite Associate"
              className="h-24 sm:h-28 md:h-32 w-auto"
            />
          </div>
        </header>

        {/* HERO */}
        <main className="flex-grow flex items-center">
          <div className="max-w-3xl text-center px-6">

            {/* Main heading */}
            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow-lg">
              Welcome to{" "}
              <span className="text-sky-300">
                Elite Associate
              </span>
            </h1>

            {/* Typing subtitle */}
            <p className="mt-6 text-blue-100 text-xl sm:text-2xl min-h-[2.6rem] drop-shadow">
              {displayText}
              <span className="opacity-70">|</span>
            </p>

            {/* CTA */}
            <div className="mt-10">
              <button
                onClick={() => navigate("/register")}
                className="
                  bg-sky-500 hover:bg-sky-600
                  text-white font-semibold
                  px-14 py-4
                  rounded-xl
                  shadow-2xl
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-sky-500/40
                "
              >
                Start Your Application →
              </button>
            </div>

          </div>
        </main>

        {/* FOOTER */}
        <footer className="pb-6 text-blue-200 text-sm">
          © Elite Associate — Placement & Training Center
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

export default Welcome;