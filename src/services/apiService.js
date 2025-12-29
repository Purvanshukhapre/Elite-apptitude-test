// Configuration
export const API_BASE_URL = ''; // Using proxy in development, so empty string for relative paths

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/auth/student/submit',
  ALL_APPLICANTS: '/auth/student/all',  // Changed to match backend API
  APPLICANTS_BY_NAME: (name) => `/auth/student/name/${name}`,  // New endpoint for getting applicants by name
  APPLICANT_TEST_DATA: (id) => `/applicants/${id}/test-data`,
  APPLICANT_FEEDBACK: (id) => `/applicants/${id}/feedback`,
  APPLICANT_BY_ID: (id) => `/auth/student/id/${id}`,
  APPLICANT_TEST_RESULT: (id) => `/test/result/${id}`,
  APPLICANT_FEEDBACK_RESULT: (id) => `/feedback/${id}`,
  SUBMIT_TEST: '/result/submit',
  
  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_PERFORMANCE: '/analytics/performance',
  ANALYTICS_SCORES: '/analytics/scores',
  TEST_RESULT_SUBMIT: '/result/submit',
  
  // Feedback
  FEEDBACK_SUBMIT: '/feedback/submit',
  FEEDBACK_ALL: '/feedback/all',
  FEEDBACK: '/feedback',
  FEEDBACK_SUMMARY: '/feedback/summary'
};

// Utility function to build full URL
export const buildUrl = (endpoint) => {
  // If endpoint is a full URL, return it as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  // If endpoint already starts with /, don't add extra /
  if (endpoint.startsWith('/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/${endpoint}`;
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API call function with improved error handling
export const apiCall = async (endpoint, options = {}) => {
  // Simulate network delay
  await delay(500);
  
  const url = buildUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  };

  try {
    // Check if this is an applicant by name endpoint to avoid CORS issues
    const isApplicantByName = typeof endpoint === 'string' && endpoint.includes('/auth/student/name/');
    
    const response = await fetch(url, {
      ...defaultOptions,
      // Don't include credentials for applicant by name to avoid CORS issues
      ...(isApplicantByName ? {} : { credentials: 'include' })
    });
    
    // For specific endpoints that might return 403, return empty data instead of throwing error
    if (!response.ok && response.status === 403) {
      console.warn(`API endpoint ${endpoint} returned 403 - returning empty data`);
      return []; // Return empty array as default for 403 responses
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // More specific error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error occurred:', error.message);
      throw new Error('Network error: Please check your connection');
    }
    
    if (error.message.includes('HTTP error')) {
      console.error('HTTP error occurred:', error.message);
      throw error;
    }
    
    console.error('API request failed:', error);
    throw new Error('API request failed: ' + error.message);
  }
};

// Specific API functions
export const getApplicants = async () => {
  return apiCall(API_ENDPOINTS.ALL_APPLICANTS);
};

export const getApplicantsByName = async (name) => {
  return apiCall(API_ENDPOINTS.APPLICANTS_BY_NAME(name));
};

export const addApplicant = async (applicantData) => {
  return apiCall(API_ENDPOINTS.APPLICANTS, {
    method: 'POST',
    body: JSON.stringify(applicantData)
  });
};

export const updateApplicantTest = async (applicantId, testData) => {
  return apiCall(API_ENDPOINTS.APPLICANT_TEST_DATA(applicantId), {
    method: 'PUT',
    body: JSON.stringify(testData)
  });
};

export const updateApplicantFeedback = async (applicantId, feedback) => {
  return apiCall(API_ENDPOINTS.APPLICANT_FEEDBACK(applicantId), {
    method: 'PUT',
    body: JSON.stringify(feedback)
  });
};

export const submitTest = async (testData) => {
  // Create the result data in the format expected by the backend
  const resultData = {
    fullName: testData.applicantName || testData.name,
    correctAnswer: testData.correctAnswers || 0
  };

  try {
    // Submit the test data to the result submission endpoint
    const submitResponse = await apiCall(API_ENDPOINTS.TEST_RESULT_SUBMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData)
    });
    
    // Return response with correct answer information
    return {
      ...submitResponse,
      correctAnswers: testData.correctAnswers || 0,
      totalQuestions: testData.questions ? testData.questions.length : 0,
      score: `${testData.correctAnswers || 0}/${testData.questions ? testData.questions.length : 0}`
    };
  } catch (submitError) {
    console.error('Test submission failed:', submitError);
    // Fallback response when API submission fails
    return {
      correctAnswers: testData.correctAnswers || 0,
      totalQuestions: testData.questions ? testData.questions.length : testData.totalQuestions || 0,
      score: `${testData.correctAnswers || 0}/${testData.questions ? testData.questions.length : testData.totalQuestions || 0}`,
      error: submitError.message,
      success: false
    };
  }
};

// Helper function to calculate correct answers
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

export const submitFeedback = async (feedbackData) => {
  return apiCall(API_ENDPOINTS.FEEDBACK_SUBMIT, {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
};

export const getAllFeedback = async () => {
  return apiCall(API_ENDPOINTS.FEEDBACK_ALL);
};

export const getAllTestResults = async () => {
  return apiCall('/result/all'); // Use the endpoint as provided
};