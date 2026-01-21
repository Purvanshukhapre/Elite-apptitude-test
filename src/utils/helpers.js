// Helper functions

// Function to extract numeric score from test data
export const getNumericScore = (applicant) => {
  // First, try to get percentage directly from applicant or test data
  if (applicant.percentage !== undefined && applicant.percentage !== null) {
    const percentage = parseFloat(applicant.percentage);
    if (!isNaN(percentage)) {
      return percentage;
    }
  }
  
  if (applicant.testData?.percentage !== undefined && applicant.testData?.percentage !== null) {
    const percentage = parseFloat(applicant.testData.percentage);
    if (!isNaN(percentage)) {
      return percentage;
    }
  }
  
  // Calculate from correct answers if total questions are known
  // Try multiple possible locations for correct answers and total questions
  const correctAnswers = applicant.correctAnswer !== undefined ? applicant.correctAnswer :
                        applicant.testData?.correctAnswer !== undefined ? applicant.testData.correctAnswer :
                        applicant.testData?.correctAnswers !== undefined ? applicant.testData.correctAnswers :
                        applicant.testResult?.correctAnswer !== undefined ? applicant.testResult.correctAnswer :
                        applicant.testResult?.correctAnswers !== undefined ? applicant.testResult.correctAnswers :
                        null;
  
  // Calculate total questions based on the questions array if available
  let totalQuestions = null;
  
  // Check if there's a questions array to determine actual total
  if (applicant.questions && Array.isArray(applicant.questions) && applicant.questions.length > 0) {
    totalQuestions = applicant.questions.length;
  } else if (applicant.questionsData?.questions && Array.isArray(applicant.questionsData.questions) && applicant.questionsData.questions.length > 0) {
    totalQuestions = applicant.questionsData.questions.length;
  } else if (applicant.testData?.questions && Array.isArray(applicant.testData.questions) && applicant.testData.questions.length > 0) {
    totalQuestions = applicant.testData.questions.length;
  }
  
  // If we couldn't determine from questions array, use fallbacks
  if (totalQuestions === null) {
    totalQuestions = applicant.totalQuestions ||
                    applicant.testData?.totalQuestions ||
                    applicant.testResult?.totalQuestions ||
                    applicant.testData?.total ||
                    applicant.testResult?.total ||
                    15; // Default assumption of 15 questions
  }
  
  if (correctAnswers !== null && totalQuestions > 0) {
    const calculatedPercentage = (correctAnswers / totalQuestions) * 100;
    return isNaN(calculatedPercentage) ? 0 : calculatedPercentage;
  }
  
  // Try to calculate from score string format (e.g., "10/15")
  const testData = applicant.testData || applicant.testResult;
  if (testData && typeof testData.score === 'string' && testData.score.includes('/')) {
    const [correct, total] = testData.score.split('/').map(Number);
    if (total > 0) {
      return (correct / total) * 100;
    }
  }
  
  // Try direct score value
  if (testData?.score && typeof testData.score === 'string' && testData.score.includes('/')) {
    // Handle score in format like "10/15"
    const [correct, total] = testData.score.split('/').map(Number);
    if (total > 0) {
      return (correct / total) * 100;
    }
  }
  
  if (testData?.score && typeof testData.score === 'number') {
    // If score is already a percentage (0-100), return as is
    if (testData.score <= 100) {
      return testData.score;
    }
    // Otherwise, it might be a raw score that needs conversion
    // Assume max score is 15 if not specified
    return (testData.score / 15) * 100;
  }
  
  // Only use feedback ratings if no test data is available
  if (applicant.rating !== undefined && applicant.rating !== null) {
    return (applicant.rating / 5) * 100;
  }
  
  return 0;
};

// Function to get submission date
export const getSubmissionDate = (applicant) => {
  return new Date(
    applicant.submittedAt || 
    applicant.createdAt || 
    applicant.updatedAt || 
    applicant.date || 
    Date.now()
  );
};

// Function to extract date from applicant with multiple fallbacks
export const extractDate = (applicant) => {
  // Try to get date from various fields
  const dateValue = applicant.submittedAt || applicant.createdAt || applicant.date || applicant.timestamp || applicant.updatedAt || applicant.testCompletedAt || applicant.feedbackSubmittedAt || applicant.created_at || applicant.updated_at || applicant.date_created || applicant.date_updated || applicant.submitted_at || applicant.created || applicant.created_date || applicant.updated || applicant.dateSubmitted || applicant.submissionDate || applicant.applicationDate;
  if (dateValue) {
    return dateValue;
  }
  // If no date field is available, try to extract from MongoDB ObjectId
  if (applicant._id) {
    try {
      const timestamp = parseInt(applicant._id.substring(0, 8), 16) * 1000;
      return new Date(timestamp);
    } catch {
      return null; // fallback to null
    }
  }
  return null; // fallback to null
};

// Function to calculate correct answers
export const calculateCorrectAnswers = (userAnswers, questions) => {
  if (!userAnswers || !questions) return 0;
  
  let correctCount = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    // Use question.id to access user answer (since userAnswers is keyed by question ID, not array index)
    const userAnswer = userAnswers[question.id];
    
    if (userAnswer !== undefined && userAnswer !== null) {
      if (question.correctAnswer === userAnswer) {
        correctCount++;
      }
    }
  }
  
  return correctCount;
};

// Function to format time in MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};