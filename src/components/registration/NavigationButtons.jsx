const NavigationButtons = ({ step, onBack, onNext, onSubmit, isValid }) => {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Back
        </button>
      )}
      {step <= 2 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="ml-auto px-8 py-3 bg-[#4A70A9] hover:bg-[#3F6296] 
           rounded-lg text-white font-medium 
           transform hover:-translate-y-0.5 hover:shadow-xl 
           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="ml-auto px-8 py-3 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          Confirm & Start Test
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;