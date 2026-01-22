import { useMemo, useState } from 'react';

const ApplicantHeader = ({ applicant }) => {
  const score = useMemo(() => {
    // Use test result data if available (from /result/all API) - prioritize test results over feedback
    if (applicant.testResult && applicant.testResult.correctAnswer !== undefined) {
      const totalQuestions = 15; // Fixed total as per API
      return ((applicant.testResult.correctAnswer / totalQuestions) * 100).toFixed(1);
    }
    
    if (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) {
      const totalQuestions = 15; // Fixed total as per API
      return ((applicant.correctAnswer / totalQuestions) * 100).toFixed(1);
    }
    
    const testData = applicant.testData;
    if (testData) {
      if (typeof testData.score === 'string' && testData.score.includes('/')) {
        const [correct, total] = testData.score.split('/').map(Number);
        if (total > 0) {
          return ((correct / total) * 100).toFixed(1);
        }
      }
      
      if (testData.percentage) {
        return parseFloat(testData.percentage).toFixed(1);
      }
      
      if (testData.score && typeof testData.score === 'number') {
        return testData.score.toFixed(1);
      }
      
      if (testData.correctAnswers !== undefined && testData.totalQuestions) {
        return ((testData.correctAnswers / testData.totalQuestions) * 100).toFixed(1);
      }
    }
    
    // Don't use feedback ratings as test score percentages
    // Only return 0 if no actual test data is available
    return '0.0';
  }, [applicant]);

  const [enlargedImage, setEnlargedImage] = useState(null);

  const openEnlargedImage = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
            {applicant.imageUrl ? (
              <>
                <img 
                  src={applicant.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openEnlargedImage(applicant.imageUrl)}
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parentDiv = e.currentTarget.parentElement;
                    parentDiv.innerHTML = `<div class="w-full h-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold">${applicant.fullName?.charAt(0) || 'A'}</div>`;
                  }}
                />
                {enlargedImage && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
                    onClick={closeEnlargedImage}
                  >
                    <div className="max-w-4xl max-h-4xl p-4">
                      <img 
                        src={enlargedImage} 
                        alt="Enlarged Profile" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                      />
                      <div className="absolute top-4 right-4 text-white text-2xl font-bold cursor-pointer" onClick={closeEnlargedImage}>
                        &times;
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                {applicant.fullName?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{applicant.fullName || applicant.name || 'Unknown Applicant'}</h1>
            <p className="text-blue-100 text-lg">{applicant.permanentEmail || applicant.email || 'N/A'}</p>
            <p className="text-blue-100">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold mb-2">{score}%</div>
          <div className="text-blue-200">Overall Score</div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantHeader;