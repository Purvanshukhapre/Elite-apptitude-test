// Configuration
export const API_BASE_URL = 'https://eliterecruitmentbackend-production.up.railway.app'; // Using production backend

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/auth/student/submit',  // Student registration endpoint
  ALL_APPLICANTS: (id) => id ? `/auth/student/${id}` : '/auth/student/all',  // GET all data for a specific applicant or all applicants
  APPLICANTS_BY_ID: (id) => `/auth/student/${id}`,  // Get user by ID (dashboard)
  APPLICANT_TEST_DATA: (id) => `/applicants/${id}/test-data`,
  APPLICANT_FEEDBACK: (id) => `/applicants/${id}/feedback`,
  APPLICANT_BY_ID: (id) => `/auth/student/${id}`,
  APPLICANT_TEST_RESULT: (id) => `/test/result/${id}`,
  APPLICANT_FEEDBACK_RESULT: (id) => `/feedback/${id}`,
  SUBMIT_TEST: (id) => `/result/${id}`,  // Submit test result with studentFormId
  SUBMIT_FEEDBACK: (id) => `/feedback/${id}`,  // Submit feedback with studentFormId
  SUBMIT_QUESTIONS: (id) => `/questions/${id}`,  // Submit questions with studentFormId
  SUBMIT_RESUME: (email) => `/resume/upload/${email}`,  // Submit resume with email in URL path
  DELETE_APPLICANT: (id) => `/auth/student/${id}`,  // Delete applicant by ID
  TEST_QUESTIONS_SUBMIT: '/questions/submit',
  TEST_QUESTIONS_ALL: '/questions/all',
  TEST_QUESTIONS_BY_EMAIL: (email) => `/questions/email/${encodeURIComponent(email)}`,

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
  
  // Check if this is an admin-protected endpoint that requires authentication
  const requiresAuth = typeof endpoint === 'string' && (
    endpoint.includes('/result/all') || 
    endpoint.includes('/auth/student/all') || 
    endpoint.includes('/auth/student/') || // All auth/student endpoints except registration require auth
    endpoint.includes('/questions/email/') || // Include test questions by email
    endpoint.includes('/feedback/all') ||
    endpoint.includes('/analytics/') ||
    endpoint.includes('/questions/') // Include questions endpoint for test submission
  ) && !endpoint.includes('/auth/student/submit') && !endpoint.includes('/questions/'); // Exclude registration and questions endpoints from requiring auth
  
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

      throw new Error('Network error: Please check your connection');
    }
    
    if (error.message.includes('HTTP error')) {

      throw error;
    }
    

    throw new Error('API request failed: ' + error.message);
  }
};

// Specific API functions
export const getApplicants = async (id) => {
  if (id) {
    // If an ID is provided, get all data for a specific applicant
    return apiCall(API_ENDPOINTS.ALL_APPLICANTS(id));
  } else {
    // If no ID provided, get all applicants (if still needed for admin panel)
    return apiCall(API_ENDPOINTS.ALL_APPLICANTS());
  }
};

export const getApplicantsById = async (id) => {
  return apiCall(API_ENDPOINTS.APPLICANTS_BY_ID(id));
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
  
  console.log('Registration API Response Expected Format:', {
    testData: result.testData || [],
    message: result.message || 'Student form submitted successfully and test generated',
    studentFormId: result.studentFormId || result.id || result._id
  });
  
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
    // Submit the test data to the result submission endpoint with studentFormId in URL
    const submitResponse = await apiCall(API_ENDPOINTS.SUBMIT_TEST(studentFormId), {
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
export const submitTestQuestions = async (testData) => {
  // Get the studentFormId
  const studentFormId = testData.studentFormId || testData.applicantId || testData.id;
  
  if (!studentFormId) {
    throw new Error('Student Form ID is required for question submission');
  }
  
  // Submit all questions with user answers to the backend using studentFormId in URL
  return apiCall(API_ENDPOINTS.SUBMIT_QUESTIONS(studentFormId), {
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
  const result = await apiCall(API_ENDPOINTS.TEST_QUESTIONS_BY_EMAIL(email));
  
  return result;
};

// Email API function
export const sendEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SEND_EMAIL, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

// Function to send resume with applicantId - Using applicantId in URL path
export const sendResumeWithEmail = async (email, resumeFile) => {
  // Validate that email is provided
  if (!email) {
    throw new Error('Email is required for resume upload');
  }
  
  // Validate that resumeFile is provided and is a File object
  if (!resumeFile || !(resumeFile instanceof File)) {
    throw new Error('Valid resume file is required for upload');
  }
  
  console.log('Resume upload details:');
  console.log('- Email:', email);
  console.log('- File name:', resumeFile.name);
  console.log('- File size:', resumeFile.size);
  console.log('- File type:', resumeFile.type);
  
  const formData = new FormData();
  // Append the file to form data as 'file' field (as per working Postman configuration)
  formData.append('file', resumeFile, resumeFile.name);
  
  // Construct the full URL
  const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.SUBMIT_RESUME(email)}`;
  console.log('Resume upload URL:', fullUrl);
  
  // Use the resume endpoint with email in URL path
  const response = await fetch(fullUrl, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - let the browser set it with the proper boundary
    mode: 'cors',
    credentials: 'omit'
  });
  
  if (!response.ok) {
    const errorText = await response.text(); // Get error details
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  // Check if response is JSON or plain text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // If not JSON, return the text response
    return response.text();
  }
};

// Function to get resume by studentFormId
export const getResumeByApplicantId = async (studentFormId) => {
  if (!studentFormId) {
    throw new Error('Student Form ID is required to fetch resume');
  }
  
  const response = await fetch(`${API_BASE_URL}/resume/${studentFormId}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit'
  });
  
  if (!response.ok) {
    const errorText = await response.text(); // Get error details
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  // Response should be JSON with resume details
  const resumeData = await response.json();
  
  // Return the resume URL from the response
  return resumeData.resumeUrl;
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

// Email notification API function for test submission
export const sendTestSubmissionEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SUBMIT_EMAIL_NOTIFICATION, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

