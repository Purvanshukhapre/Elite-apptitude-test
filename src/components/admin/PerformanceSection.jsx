import StarRating from '../StarRating';
import { useMemo } from 'react';

const PerformanceSection = ({ applicant }) => {
  const score = useMemo(() => {
    // Use test result data if available (from /result/all API) - prioritize test results over feedback
    if (applicant.testResult && applicant.testResult.correctAnswer !== undefined) {
      const totalQuestions = 15; // Fixed total as per API
      return ((applicant.testResult.correctAnswer / totalQuestions) * 100);
    }
    
    if (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) {
      const totalQuestions = 15; // Fixed total as per API
      return ((applicant.correctAnswer / totalQuestions) * 100);
    }
    
    const testData = applicant.testData;
    if (testData) {
      if (typeof testData.score === 'string' && testData.score.includes('/')) {
        const [correct, total] = testData.score.split('/').map(Number);
        if (total > 0) {
          return ((correct / total) * 100);
        }
      }
      
      if (testData.percentage) {
        return parseFloat(testData.percentage);
      }
      
      if (testData.score && typeof testData.score === 'number') {
        return testData.score;
      }
      
      if (testData.correctAnswers !== undefined && testData.totalQuestions) {
        return ((testData.correctAnswers / testData.totalQuestions) * 100);
      }
    }
    
    // Don't use feedback ratings as test score percentages
    // Only return 0 if no actual test data is available
    return 0;
  }, [applicant]);

  const totalQuestions = 15; // Fixed total as per API
  const correctAnswers = (applicant.testResult && applicant.testResult.correctAnswer !== undefined) 
    ? applicant.testResult.correctAnswer 
    : (applicant.testData?.correctAnswers !== undefined ? applicant.testData.correctAnswers : 
       (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null ? applicant.correctAnswer : 0));

  const timeSpent = applicant.testData?.timeSpent || 0; // in seconds

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Breakdown</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 font-medium">Score Distribution</span>
              <span className="text-gray-900 font-bold">{score.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${
                  score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  score >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-800">{correctAnswers}</div>
              <div className="text-green-700">Correct</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-800">{totalQuestions - correctAnswers}</div>
              <div className="text-red-700">Incorrect</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h4 className="font-bold text-gray-900 mb-4">Test Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Applied Position</span>
              <span className="text-gray-900 font-medium">{applicant.postAppliedFor || applicant.position || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions</span>
              <span className="text-gray-900 font-medium">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Correct Answers</span>
              <span className="text-gray-900 font-medium">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overall Score</span>
              <span className="text-gray-900 font-medium">{score.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Spent</span>
              <span className="text-gray-900 font-medium">{formatTime(timeSpent)}</span>
            </div>
            {(applicant.overallRating || applicant.rating) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Feedback Rating</span>
                <div className="flex items-center">
                  <StarRating rating={applicant.overallRating || applicant.rating} maxRating={5} />
                  <span className="ml-2 text-gray-900 font-medium">({applicant.overallRating || applicant.rating}/5)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSection;