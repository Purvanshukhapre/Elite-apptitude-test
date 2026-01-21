import { useMemo } from 'react';

const TestQuestionsSection = ({ applicant, loading }) => {
  const questionsData = useMemo(() => {
    // NEW LOGIC: Handle the nested questions structure from the API response
    // The API returns questions at response.questions?.questions
    let finalQuestions = [];
    
    // Try to get questions from the most reliable source: response.questions.questions
    if (applicant.questions && typeof applicant.questions === 'object' && applicant.questions.questions) {
      // This handles the case where applicant.questions = { questions: [...] }
      finalQuestions = applicant.questions.questions;
    } else if (Array.isArray(applicant.questions) && applicant.questions.length > 0) {
      // This handles the case where applicant.questions is directly an array
      finalQuestions = applicant.questions;
    } else if (applicant.questionsData && applicant.questionsData.questions) {
      // Fallback to questionsData
      finalQuestions = applicant.questionsData.questions;
    } else if (Array.isArray(applicant.questionsData) && applicant.questionsData.length > 0) {
      // Fallback to array format
      finalQuestions = applicant.questionsData;
    } else if (applicant.testData && applicant.testData.questions) {
      // Last fallback
      finalQuestions = applicant.testData.questions;
    }
    
    return {
      finalQuestions
    };
  }, [applicant]);

  const { finalQuestions } = questionsData;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Test Questions & Answers</h3>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (finalQuestions.length > 0) ? (
        <div className="space-y-4">
          {finalQuestions.map((question, index) => {
            // 🔥 GET USER ANSWER DIRECTLY FROM QUESTION OBJECT
            const userAnswer = question.userAnswer !== undefined 
              ? question.userAnswer 
              : undefined;
            
            // 🔥 GET CORRECT ANSWER DIRECTLY FROM QUESTION OBJECT  
            const correctAnswer = question.aiAnswer !== undefined 
              ? question.aiAnswer 
              : question.correctAnswer !== undefined 
                ? question.correctAnswer 
                : undefined;
            
            // 🔥 DETERMINE IF ANSWER IS CORRECT
            let isCorrect = false;
            if (correctAnswer !== undefined && userAnswer !== undefined) {
              // Compare the answer strings directly (they're both in the same format)
              isCorrect = correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
            }
            
            // Determine the question text
            const questionText = question.question || question.aiQuestion || question.Question || question.text || 'N/A';
            
            // Determine options
            const options = question.options || question.Options || question.optionsList || question.optionList || [];
            
            return (
              <div 
                key={question.id || question._id || question.questionId || index} 
                className={`p-4 rounded-xl border ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-3">{questionText}</h4>
                    
                    <div className="space-y-2 mb-3">
                      {options.map((option, optIndex) => {
                        const isSelected = userAnswer !== undefined && 
                          option.toString().trim().toLowerCase() === userAnswer.toString().trim().toLowerCase();
                        
                        const isAnswer = correctAnswer !== undefined && 
                          option.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`p-3 rounded-lg border flex items-start ${
                              isSelected 
                                ? isCorrect
                                  ? 'border-green-500 bg-green-100' 
                                  : 'border-red-500 bg-red-100'
                                : isAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 ${
                              isSelected 
                                ? isCorrect
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white'
                                : isAnswer
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <div className="flex-1">
                              <span className={`${
                                isSelected 
                                  ? isCorrect
                                    ? 'text-green-800 font-medium' 
                                    : 'text-red-800 font-medium'
                                  : isAnswer
                                    ? 'text-green-800 font-medium'
                                    : 'text-gray-700'
                              }`}>
                                {option}
                              </span>
                              {isSelected && (
                                <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  Your Answer
                                </span>
                              )}
                              {isAnswer && !isSelected && (
                                <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                                  Correct Answer
                                </span>
                              )}
                              {isAnswer && isSelected && (
                                <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-200 text-green-900">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No test questions and answers available for this applicant.
        </div>
      )}
    </div>
  );
};

export default TestQuestionsSection;
