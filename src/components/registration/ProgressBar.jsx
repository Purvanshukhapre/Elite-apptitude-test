const ProgressBar = ({ step }) => {
  return (
    <div className="mb-10">
      <div className="relative flex items-center justify-between">
        {/* Base line (connected to circles) */}
        <div className="absolute top-6 left-[16.66%] right-[16.66%] h-1 bg-[#577FCD] rounded-full" />

        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center w-1/3">
            {/* Circle */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2
              ${
                step > s || (step === s && s !== 3)
                  ? "bg-[#577FCD] border-blue-400 text-white"
                  : "bg-white border-blue-700 text-blue-700"
              }`}
            >
              {(step > s || (step === s && s !== 3)) && (
                <span className="text-xl font-bold">✓</span>
              )}
            </div>

            {/* Label */}
            <span className="mt-3 text-sm font-semibold tracking-wider text-white">
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