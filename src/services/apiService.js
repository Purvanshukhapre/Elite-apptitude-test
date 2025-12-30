// Configuration
export const API_BASE_URL = ''; // Using proxy in development, so empty string for relative paths

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/auth/student/submit',  // Using proxy in development
  ALL_APPLICANTS: '/auth/student/all',  // Using proxy in development
  APPLICANTS_BY_NAME: (name) => `/auth/student/name/${name}`,  // Using proxy in development
  APPLICANT_TEST_DATA: (id) => `/applicants/${id}/test-data`,  // Using proxy in development
  APPLICANT_FEEDBACK: (id) => `/applicants/${id}/feedback`,  // Using proxy in development
  APPLICANT_BY_ID: (id) => `/auth/student/id/${id}`,  // Using proxy in development
  APPLICANT_TEST_RESULT: (id) => `/test/result/${id}`,  // Using proxy in development
  APPLICANT_FEEDBACK_RESULT: (id) => `/feedback/${id}`,  // Using proxy in development
  SUBMIT_TEST: '/result/submit',  // Using proxy in development
  TEST_QUESTIONS_SUBMIT: '/questions/submit',
  TEST_QUESTIONS_ALL: '/questions/all',
  TEST_QUESTIONS_BY_EMAIL: (email) => `/questions/email/${email}`,

  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',  // Using proxy in development
  ANALYTICS_PERFORMANCE: '/analytics/performance',  // Using proxy in development
  ANALYTICS_SCORES: '/analytics/scores',  // Using proxy in development
  TEST_RESULT_SUBMIT: '/result/submit',  // Using proxy in development
  
  // Feedback
  FEEDBACK_SUBMIT: '/feedback/submit',  // Using proxy in development
  FEEDBACK_ALL: '/feedback/all',  // Using proxy in development
  FEEDBACK: '/feedback',  // Using proxy in development
  FEEDBACK_SUMMARY: '/feedback/summary',  // Using proxy in development
  
  // Test Results
  TEST_RESULTS_ALL: '/result/all'  // Using proxy in development
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
  
  // Check if this is an admin-protected endpoint that requires authentication
  const requiresAuth = typeof endpoint === 'string' && (
    endpoint.includes('/result/all') || 
    endpoint.includes('/auth/student/all') || 
    endpoint.includes('/feedback/all') ||
    endpoint.includes('/analytics/')
  );
  
  // Get admin token from localStorage if available
  const adminToken = localStorage.getItem('adminToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Add authorization header for admin-protected endpoints
      ...(requiresAuth && adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
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
  return apiCall(API_ENDPOINTS.TEST_RESULTS_ALL);
};

// New API functions for test questions
export const submitTestQuestions = async (testData) => {
  // Submit all questions with user answers to the backend
  return apiCall(API_ENDPOINTS.TEST_QUESTIONS_SUBMIT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
  });
};

export const getAllTestQuestions = async () => {
  // Get all test questions with answers from the backend
  return apiCall(API_ENDPOINTS.TEST_QUESTIONS_ALL);
};

export const getTestQuestionsByEmail = async (email) => {
  // Get test questions for a specific user by email
  return apiCall(API_ENDPOINTS.TEST_QUESTIONS_BY_EMAIL(email));
};

