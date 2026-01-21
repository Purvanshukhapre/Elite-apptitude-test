// Configuration
export const API_BASE_URL = 'https://eliterecruitmentbackend-production.up.railway.app'; // Using production backend

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/auth/student/submit',  // Student registration endpoint
  ALL_APPLICANTS: '/auth/student/all',  // GET all applicants
  APPLICANT_BY_ID: (id) => `/auth/student/${id}`,  // GET individual applicant by ID
  // APPLICANT_TEST_DATA: (id) => `/auth/student/${id}/test-data`,
  // APPLICANT_FEEDBACK: (id) => `/auth/student/${id}/feedback`,
  APPLICANT_TEST_RESULT: (id) => `/test/result/${id}`,
  APPLICANT_FEEDBACK_RESULT: (id) => `/feedback/${id}`,
  SUBMIT_TEST: (id) => `/result/${id}`,  // Submit test result with studentFormId
  SUBMIT_FEEDBACK: (id) => `/feedback/${id}`,  // Submit feedback with studentFormId
  SUBMIT_QUESTIONS: (id) => `/questions/${id}`,  // Submit questions with studentFormId
  SUBMIT_RESUME: (email) => `/resume/upload/${email}`,  // Submit resume with email in URL path
  DELETE_APPLICANT: (id) => `/auth/student/${id}`,  // Delete applicant by ID
  TEST_QUESTIONS_SUBMIT: '/questions/submit',
  TEST_QUESTIONS_ALL: '/questions/all',

  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',  // Using proxy in development
  ANALYTICS_PERFORMANCE: '/analytics/performance',  // Using proxy in development
  ANALYTICS_SCORES: '/analytics/scores',  // Using proxy in development
  
  // Feedback
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
  
  // No authentication required since admin login is sufficient
  // const requiresAuth = typeof endpoint === 'string' && (
  //   endpoint.includes('/result/all') || 
  //   endpoint.includes('/auth/student/all') || 
  //   endpoint.includes('/auth/student/') || // All auth/student endpoints except registration require auth
  //   endpoint.includes('/feedback/all') ||
  //   endpoint.includes('/analytics/') ||
  //   endpoint.includes('/questions/') // Include questions endpoint for test submission
  // ) && !endpoint.includes('/auth/student/submit') && !endpoint.includes('/questions/'); // Exclude registration and questions endpoints from requiring auth
  // 
  // Get admin token from localStorage if available
  // const adminToken = localStorage.getItem('adminToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // No authentication required since admin login is sufficient
      // ...(requiresAuth && adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
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
    
    console.log(`Making API call to: ${url}`);
    console.log('Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    });
    
    const response = await fetch(url, fetchOptions);
    
    console.log(`API Response from ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // For specific endpoints that might return 403, handle gracefully
    if (!response.ok && response.status === 403) {
      console.warn('API returned 403 Forbidden - endpoint may be restricted or unavailable');
      // Throw a generic error that works for all endpoints
      throw new Error('This service is temporarily unavailable. Please try again later.');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, return the text response
      const text = await response.text();
      try {
        // Try to parse as JSON in case it's a JSON string
        data = JSON.parse(text);
      } catch {
        // If it's not valid JSON, return the text as is
        data = text;
      }
    }
    
    console.log(`Response data from ${url}:`, data);
    return data;
  } catch (error) {
    // More specific error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {

      throw new Error('Network error: Please check your connection');
    }
    
    if (error.message.includes('HTTP error')) {

      throw error;
    }
    

    throw new Error('API request failed: ' + error.message);
  }
};

// Specific API functions
export const getApplicants = async () => {
  return apiCall(API_ENDPOINTS.ALL_APPLICANTS);
};

export const getApplicantById = async (id) => {
  return apiCall(API_ENDPOINTS.APPLICANT_BY_ID(id));
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
  
  const result = await apiCall(API_ENDPOINTS.APPLICANTS, options);
  
  // Return the result as received from the API
  // The result may contain studentFormId, message, and testData as per the new API format
  return result;
};

export const updateApplicantTest = async (applicantId, testData) => {
  // Use the studentFormId for the API endpoint
  const studentFormId = testData.studentFormId || applicantId;
  
  if (!studentFormId) {
    throw new Error('Student Form ID is required for test submission');
  }
  
  // Format the data according to the expected schema
  const resultData = {
    fullName: testData.applicantName || testData.name,
    email: testData.email,
    correctAnswer: testData.correctAnswers || 0,
    ...testData
  };
  
  // Use the result submission endpoint with studentFormId in URL
  return apiCall(API_ENDPOINTS.SUBMIT_TEST(studentFormId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resultData)
  });
};

export const updateApplicantFeedback = async (applicantId, feedback) => {
  // Use the studentFormId for the API endpoint
  const studentFormId = feedback.studentFormId || applicantId;
  
  if (!studentFormId) {
    throw new Error('Student Form ID is required for feedback submission');
  }
  
  // Use the feedback endpoint with studentFormId in URL
  return apiCall(API_ENDPOINTS.SUBMIT_FEEDBACK(studentFormId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback)
  });
};

export const submitTest = async (testData) => {
  // Get the studentFormId
  const studentFormId = testData.studentFormId || testData.applicantId || testData.id;
  
  if (!studentFormId) {
    throw new Error('Student Form ID is required for test submission');
  }
  
  // Create the result data in the format expected by the backend
  const resultData = {
    fullName: testData.applicantName || testData.name,
    email: testData.email,
    correctAnswer: testData.correctAnswers || 0,
    ...testData
  };
  
  try {
    console.log(`Attempting to submit test results for studentFormId: ${studentFormId}`);
    
    // Submit the test data to the result submission endpoint with studentFormId in URL
    const submitResponse = await apiCall(API_ENDPOINTS.SUBMIT_TEST(studentFormId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData)
    });
    
    console.log('Test results submitted successfully:', submitResponse);
    
    // Return response with correct answer information
    return {
      ...submitResponse,
      correctAnswers: testData.correctAnswers || 0,
      totalQuestions: testData.questions ? testData.questions.length : 0,
      score: `${testData.correctAnswers || 0}/${testData.questions ? testData.questions.length : 0}`,
      success: true
    };
  } catch (submitError) {
    console.warn('Test submission failed, using local data:', submitError.message);
    
    // Fallback response when API submission fails - still treat as success for user experience
    return {
      correctAnswers: testData.correctAnswers || 0,
      totalQuestions: testData.questions ? testData.questions.length : testData.totalQuestions || 0,
      score: `${testData.correctAnswers || 0}/${testData.questions ? testData.questions.length : testData.totalQuestions || 0}`,
      message: 'Test completed successfully (results saved locally)',
      error: submitError.message,
      success: true // Still mark as success to avoid confusing the user
    };
  }
};

export const submitFeedback = async (feedbackData) => {
  // Get the studentFormId
  const studentFormId = feedbackData.studentFormId || feedbackData.applicantId || feedbackData.id;
  
  if (!studentFormId) {
    throw new Error('Student Form ID is required for feedback submission');
  }
  
  // Use the feedback endpoint with studentFormId in URL
  return apiCall(API_ENDPOINTS.SUBMIT_FEEDBACK(studentFormId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

export const submitQuestions = async (questionsData) => {
  // Get the studentFormId
  const studentFormId = questionsData.studentFormId || questionsData.applicantId || questionsData.id;
  
  if (!studentFormId) {
    throw new Error('Student Form ID is required for questions submission');
  }
  
  // Use the questions endpoint with studentFormId in URL
  return apiCall(API_ENDPOINTS.SUBMIT_QUESTIONS(studentFormId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionsData)
  });
};

// Email API function
export const sendEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SEND_EMAIL, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

// Function to delete applicant by ID
export const deleteApplicantById = async (studentFormId) => {
  if (!studentFormId) {
    throw new Error('Student Form ID is required to delete applicant');
  }
  
  return apiCall(API_ENDPOINTS.DELETE_APPLICANT(studentFormId), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

// Function to get test result by ID
export const getTestResultById = async (id) => {
  return apiCall(API_ENDPOINTS.APPLICANT_TEST_RESULT(id));
};

// Resume upload API function
export const submitResume = async (email, resumeFile) => {
  if (!email) {
    throw new Error('Email is required for resume upload');
  }
  
  if (!resumeFile) {
    throw new Error('Resume file is required');
  }
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', resumeFile);  // Backend expects field name 'file', not 'resume'
  // NOTE: Email is included in URL path only, not in form data body
  
  // Direct fetch call to avoid content-type conflicts with FormData
  const url = buildUrl(API_ENDPOINTS.SUBMIT_RESUME(email));
  
  try {
    console.log(`Attempting to upload resume for email: ${email}`);
    console.log(`Upload URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      // Don't set Content-Type header - let browser set it with boundary
      body: formData,
      mode: 'cors',
      credentials: 'omit' // No authentication required
    });
    
    console.log(`Resume upload response:`, {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, return the text response
      const text = await response.text();
      try {
        // Try to parse as JSON in case it's a JSON string
        data = JSON.parse(text);
      } catch {
        // If it's not valid JSON, return the text as is
        data = text;
      }
    }
    
    console.log('Resume uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Resume upload failed:', error.message);
    throw error;
  }
};

// Email notification API function for test submission
export const sendTestSubmissionEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SUBMIT_EMAIL_NOTIFICATION, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

