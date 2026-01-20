import { useMemo } from 'react';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const ApplicantStats = ({ applicant }) => {
  const stats = useMemo(() => {
    const totalQuestions = 15; // Fixed total as per API
    
    // Extract correct answers from multiple possible sources in the API response
    const correctAnswers = 
      // Priority 1: result field from API response
      (applicant.result && applicant.result.correctAnswer !== undefined) ? applicant.result.correctAnswer :
      // Priority 2: testResult field
      (applicant.testResult && applicant.testResult.correctAnswer !== undefined) ? applicant.testResult.correctAnswer :
      // Priority 3: testData field
      (applicant.testData?.correctAnswers !== undefined) ? applicant.testData.correctAnswers :
      // Priority 4: direct correctAnswer field
      (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) ? applicant.correctAnswer :
      // Fallback
      0;
    
    // Extract time spent from multiple possible sources
    const timeSpent = 
      (applicant.result && applicant.result.timeSpent !== undefined) ? applicant.result.timeSpent :
      (applicant.testResult && applicant.testResult.timeSpent !== undefined) ? applicant.testResult.timeSpent :
      (applicant.testData?.timeSpent !== undefined) ? applicant.testData.timeSpent :
      0; // in seconds

    return {
      totalQuestions,
      correctAnswers,
      timeSpent
    };
  }, [applicant]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-xl mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Questions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-xl mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Correct Answers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.correctAnswers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="p-3 bg-amber-100 rounded-xl mr-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Time Spent</p>
            <p className="text-2xl font-bold text-gray-900">{formatTime(stats.timeSpent)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-xl mr-4">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Feedback Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              {applicant.overallRating !== undefined && applicant.overallRating !== null 
                ? applicant.overallRating 
                : (applicant.rating !== undefined && applicant.rating !== null ? applicant.rating : 'N/A')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantStats;