const ProgressBar = ({ step }) => {
  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between">
        {/* Base line (connected to circles) */}
        <div className="absolute top-6 left-[16.66%] right-[16.66%] h-1 bg-gray-300 rounded-full z-0" />

        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center w-1/3">
            {/* Circle */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-4
              ${
                step >= s
                  ? "bg-blue-600 border-blue-700 text-white shadow-lg" // Active/Completed step
                  : "bg-white border-gray-400 text-blue-600 shadow-lg" // Inactive step
              }`}
            >
              {step > s ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`text-lg font-bold ${step >= s ? 'text-white' : 'text-blue-600'}`}>{s}</span>
              )}
            </div>

            {/* Label */}
            <span className={`mt-3 text-sm font-semibold tracking-wide text-white`}>
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