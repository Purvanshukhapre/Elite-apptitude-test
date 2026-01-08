// Configuration
export const API_BASE_URL = 'https://eliterecruitmentbackend-production.up.railway.app'; // Using production backend

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/auth/student/submit',  // Using proxy in development
  ALL_APPLICANTS: '/auth/student/all',  // Using proxy in development
  APPLICANTS_BY_NAME: (name) => `/auth/student/name/${encodeURIComponent(name)}`,  // Using proxy in development
  APPLICANT_TEST_DATA: (id) => `/applicants/${id}/test-data`,  // Using proxy in development
  APPLICANT_FEEDBACK: (id) => `/applicants/${id}/feedback`,  // Using proxy in development
  APPLICANT_BY_ID: (id) => `/auth/student/id/${id}`,  // Using proxy in development
  APPLICANT_TEST_RESULT: (id) => `/test/result/${id}`,  // Using proxy in development
  APPLICANT_FEEDBACK_RESULT: (id) => `/feedback/${id}`,  // Using proxy in development
  SUBMIT_TEST: '/result/submit',  // Using proxy in development
  TEST_QUESTIONS_SUBMIT: '/questions/submit',
  TEST_QUESTIONS_ALL: '/questions/all',
  TEST_QUESTIONS_BY_EMAIL: (email) => `/questions/email/${encodeURIComponent(email)}`,

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
  TEST_RESULTS_ALL: '/result/all',  // Using proxy in development
  
  // Email
  SEND_EMAIL: '/admin/email/send',  // Using proxy in development
  SUBMIT_EMAIL_NOTIFICATION: '/email-verification/submit'  // Using proxy in development
};

// Utility function to build full URL
export const buildUrl = (endpoint) => {
  // If endpoint starts with /, it's a relative path
  if (endpoint.startsWith('/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Otherwise, return as is (for full URLs)
  return endpoint;
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
    ...options
  };

  try {
    // Check if this is an applicant by name endpoint to avoid CORS issues
    const isApplicantByName = typeof endpoint === 'string' && endpoint.includes('/auth/student/name/');
    
    const fetchOptions = {
      ...defaultOptions
    };
    
    // For production backend, we need to handle CORS properly
    if (API_BASE_URL.includes('railway.app')) {
      fetchOptions.mode = 'cors';
      fetchOptions.credentials = 'omit'; // Use 'omit' for cross-origin requests
    } else {
      // Don't include credentials for applicant by name to avoid CORS issues
      if (!isApplicantByName) {
        fetchOptions.credentials = 'include';
      }
    }
    
    const response = await fetch(url, fetchOptions);
    
    // For specific endpoints that might return 403, return empty data instead of throwing error
    if (!response.ok && response.status === 403) {
      console.warn(`API endpoint ${endpoint} returned 403 - returning empty data`);
      return []; // Return empty array as default for 403 responses
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      // If not JSON, return the text response
      const text = await response.text();
      try {
        // Try to parse as JSON in case it's a JSON string
        return JSON.parse(text);
      } catch {
        // If it's not valid JSON, return the text as is
        return text;
      }
    }
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
  // For this endpoint, we only send JSON data (resume is handled separately)
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicantData),
  };
  
  return apiCall(API_ENDPOINTS.APPLICANTS, options);
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
  try {
    // console.log('API call to:', API_ENDPOINTS.TEST_QUESTIONS_BY_EMAIL(email));
    const result = await apiCall(API_ENDPOINTS.TEST_QUESTIONS_BY_EMAIL(email));
    // console.log('API response:', result);
    return result;
  } catch (error) {
    console.error('Error fetching questions by email:', error);
    throw error;
  }
};

// Email API function
export const sendEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SEND_EMAIL, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

// Function to send resume with email - Using email in URL path as per backend requirement
export const sendResumeWithEmail = async (email, resumeFile) => {
  const formData = new FormData();
  // Append the file to form data as 'file' field as per Postman test requirement
  formData.append('file', resumeFile, resumeFile.name);
  
  // Direct fetch call with email in the URL path
  // Using regular cors mode to match other working APIs
  const response = await fetch(`${API_BASE_URL}/resume/upload/${encodeURIComponent(email)}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - let the browser set it with the proper boundary
    mode: 'cors',
    credentials: 'omit'
  });
  
  if (!response.ok) {
    const errorText = await response.text(); // Get error details
    console.error('Resume upload with email failed:', response.status, errorText);
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  return response.json();
};

// Function to get resume by email - Using email in URL path as per backend requirement
export const getResumeByEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}/resume/email/${encodeURIComponent(email)}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit'
  });
  
  if (!response.ok) {
    const errorText = await response.text(); // Get error details
    console.error('Resume fetch by email failed:', response.status, errorText);
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  return response.json();
};

// Email notification API function for test submission
export const sendTestSubmissionEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SUBMIT_EMAIL_NOTIFICATION, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

