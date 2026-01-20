import { useMemo } from 'react';

const TestQuestionsSection = ({ applicant, loading }) => {
  const questionsData = useMemo(() => {
    // NEW LOGIC: Handle the nested questions structure from the API response
    // The API returns questions at response.questions?.questions
    const testQuestions = applicant.questions?.questions || [];
    
    // Get answers from multiple possible sources - prioritize the most reliable
    const answersProvided = applicant.testData?.answers || 
                         applicant.answers || 
                         applicant.testData?.userAnswers || 
                         applicant.userAnswers || 
                         applicant.testData?.userAnswer || 
                         applicant.userAnswer || 
                         applicant.testData?.selectedAnswers || 
                         applicant.selectedAnswers || 
                         applicant.testQuestions?.userAnswers || 
                         applicant.testQuestions?.answers || [];

    // Extract questions from questionsData if available (object format)
    const questionsFromData = applicant.questionsData && typeof applicant.questionsData === 'object' && !Array.isArray(applicant.questionsData) && applicant.questionsData.questions ? 
      applicant.questionsData.questions : [];
    
    // Extract questions from array format (multiple attempts)
    const questionsFromArray = Array.isArray(applicant.questionsData) && applicant.questionsData.length > 0 ? 
      applicant.questionsData.flatMap(attempt => attempt.questions || []) : [];
    
    // Extract questions from other possible formats
    const questionsFromTestData = applicant.testData?.questions || [];
    const questionsFromApplicant = applicant.questions || [];
    
    // Handle questionsData that might be directly an array of questions
    const questionsDirectArray = Array.isArray(applicant.questionsData) && applicant.questionsData.length > 0 && 
      !applicant.questionsData.some(item => item.questions) ? applicant.questionsData : [];
    
    // Combine all available questions from different sources
    // Prioritize the new API structure (response.questions?.questions) first
    const allQuestions = [
      ...testQuestions, // NEW: From API response.questions.questions
      ...questionsFromData,
      ...questionsFromArray,
      ...questionsDirectArray,
      ...questionsFromTestData,
      ...questionsFromApplicant
    ];
    
    // Remove duplicates based on question ID if available, otherwise use all questions
    const uniqueQuestions = allQuestions.filter((question, index, self) =>
      question.id ? self.findIndex(q => q.id === question.id) === index : true
    );
    
    // Use unique questions if available, otherwise fall back to all questions
    const finalQuestions = uniqueQuestions.length > 0 ? uniqueQuestions : allQuestions;

    return {
      finalQuestions,
      answersProvided
    };
  }, [applicant]);

  const { finalQuestions, answersProvided } = questionsData;

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
            // Handle different possible data structures for answers
            let userAnswer;
            if (answersProvided && typeof answersProvided === 'object') {
              // If answersProvided is an object, check for the question ID
              userAnswer = answersProvided[question.id] !== undefined 
                ? answersProvided[question.id] 
                : answersProvided[question._id] !== undefined 
                  ? answersProvided[question._id] 
                  : answersProvided[question.questionId] !== undefined
                    ? answersProvided[question.questionId]
                    : answersProvided[index];
            } else if (Array.isArray(answersProvided)) {
              // If answersProvided is an array, use the index
              userAnswer = answersProvided[index];
            } else {
              userAnswer = undefined;
            }
            
            // Determine correct answer based on available data
            const correctAnswer = question.correctAnswer !== undefined 
              ? question.correctAnswer 
              : question.correctOptionText !== undefined 
                ? question.correctOptionText 
                : question.aiAnswer !== undefined
                  ? question.aiAnswer
                  : undefined;
            
            // Determine if the answer is correct
            let isCorrect;
            if (correctAnswer !== undefined && userAnswer !== undefined) {
              if (typeof correctAnswer === 'number' && typeof userAnswer === 'number') {
                // Both are numbers (option indices)
                isCorrect = correctAnswer === userAnswer;
              } else if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
                // Both are strings (option text)
                isCorrect = correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
              } else if (question.options && typeof correctAnswer === 'number' && typeof userAnswer === 'string') {
                // Correct answer is an index but user answer is a string
                isCorrect = question.options[correctAnswer]?.toString().trim().toLowerCase() === userAnswer.toString().trim().toLowerCase();
              } else if (question.options && typeof correctAnswer === 'string' && typeof userAnswer === 'number') {
                // Correct answer is a string but user answer is an index
                isCorrect = question.options[userAnswer]?.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();
              } else {
                isCorrect = correctAnswer === userAnswer;
              }
            } else {
              isCorrect = false; // Default to incorrect if either answer is undefined
            }
            
            // Determine the question text
            const questionText = question.question || question.aiQuestion || question.Question || question.text || 'N/A';
            
            // Determine options
            const options = question.options || question.Options || question.optionsList || question.optionList || [];
            
            return (
              <div 
                key={question.id || question._id || question.questionId || index} 
                className={`p-4 rounded-xl border ${
                  isCorrect !== undefined && isCorrect
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        isCorrect !== undefined && isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isCorrect !== undefined && isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect !== undefined && isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-3">{questionText}</h4>
                    
                    <div className="space-y-2 mb-3">
                      {options.map((option, optIndex) => {
                        const isSelected = userAnswer !== undefined && (
                          (typeof userAnswer === 'number' && userAnswer === optIndex) ||
                          (typeof userAnswer === 'string' && option.toString().trim().toLowerCase() === userAnswer.toString().trim().toLowerCase()) ||
                          (typeof userAnswer === 'number' && option.toString().includes(userAnswer.toString()))
                        );
                        
                        const isAnswer = correctAnswer !== undefined && (
                          (typeof correctAnswer === 'number' && correctAnswer === optIndex) ||
                          (typeof correctAnswer === 'string' && option.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()) ||
                          (typeof correctAnswer === 'number' && option.toString().includes(correctAnswer.toString()))
                        );
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`p-3 rounded-lg border flex items-start ${
                              isSelected 
                                ? isCorrect !== undefined && isCorrect
                                  ? 'border-green-500 bg-green-100' 
                                  : 'border-red-500 bg-red-100'
                                : isAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 ${
                              isSelected 
                                ? isCorrect !== undefined && isCorrect
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
                                  ? isCorrect !== undefined && isCorrect
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
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Category:</span> {question.category || question.Category || 'N/A'} | 
                      <span className="font-medium ml-1">Difficulty:</span> {question.difficulty || question.Difficulty || 'N/A'}
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