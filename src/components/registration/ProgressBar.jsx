const ProgressBar = ({ step }) => {
  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between">
        {/* Base line (connected to circles) */}
        <div className="absolute top-6 left-[16.66%] right-[16.66%] h-1 bg-blue-300 rounded-full" />

        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center w-1/3">
            {/* Circle */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2
              ${
                step >= s
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-blue-300 text-blue-300"
              }`}
            >
              {step > s ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-bold">{s}</span>
              )}
            </div>

            {/* Label */}
            <span className={`mt-3 text-sm font-semibold tracking-wide ${step >= s ? 'text-blue-800' : 'text-blue-400'}`}>
              {s === 1 && "Personal Info"}
              {s === 2 && "Position Details"}
              {s === 3 && "Review"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;