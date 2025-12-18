// API Configuration File
// This file contains all API endpoints and configuration
// To switch to production, simply update the API_BASE_URL

// Configuration
export const API_BASE_URL = 'http://localhost:3001/api'; // Change this to your production URL

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/applicants',
  APPLICANT_TEST_DATA: (id) => `/applicants/${id}/test-data`,
  APPLICANT_FEEDBACK: (id) => `/applicants/${id}/feedback`,
  
  // Tests
  QUESTIONS: '/questions',
  SUBMIT_TEST: '/tests/submit',
  
  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_PERFORMANCE: '/analytics/performance',
  ANALYTICS_SCORES: '/analytics/scores',
  
  // Feedback
  FEEDBACK: '/feedback',
  FEEDBACK_SUMMARY: '/feedback/summary'
};

// Utility function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const getApplicants = async () => {
  return apiCall(API_ENDPOINTS.APPLICANTS);
};

export const getApplicantById = async (id) => {
  // We can get applicant data from the main applicants collection
  // This function is kept for potential future use
  const applicants = await getApplicants();
  return applicants.find(applicant => applicant.id === id);
};

export const getQuestions = async () => {
  return apiCall(API_ENDPOINTS.QUESTIONS);
};

export const submitTest = async (testData) => {
  return apiCall(API_ENDPOINTS.SUBMIT_TEST, {
    method: 'POST',
    body: JSON.stringify(testData)
  });
};

export const getAnalyticsDashboard = async () => {
  return apiCall(API_ENDPOINTS.ANALYTICS_DASHBOARD);
};

export const getFeedback = async () => {
  return apiCall(API_ENDPOINTS.FEEDBACK);
};

export const submitFeedback = async (feedbackData) => {
  return apiCall(API_ENDPOINTS.FEEDBACK, {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiCall,
  getApplicants,
  getApplicantById,
  getQuestions,
  submitTest,
  getAnalyticsDashboard,
  getFeedback,
  submitFeedback
};