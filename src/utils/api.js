// Centralized API utility
import { API_BASE_URL, API_ENDPOINTS } from '../services/apiService';

// Generic API call function with improved error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
    ...options
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  
  // Check if response is JSON or plain text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
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
};

// Specific API functions
export const getApplicants = async () => {
  return apiCall(API_ENDPOINTS.ALL_APPLICANTS());
};

export const getAllFeedback = async () => {
  return apiCall(API_ENDPOINTS.FEEDBACK_ALL);
};

export const getAllTestResults = async () => {
  return apiCall(API_ENDPOINTS.TEST_RESULTS_ALL);
};



export const submitTest = async (testData) => {
  const studentFormId = testData.studentFormId || testData.applicantId || testData.id;
  if (!studentFormId) {
    throw new Error('Student Form ID is required for test submission');
  }
  
  return apiCall(API_ENDPOINTS.SUBMIT_TEST(studentFormId), {
    method: 'POST',
    body: JSON.stringify(testData)
  });
};

export const submitFeedback = async (feedbackData) => {
  const studentFormId = feedbackData.studentFormId || feedbackData.applicantId || feedbackData.id;
  if (!studentFormId) {
    throw new Error('Student Form ID is required for feedback submission');
  }
  
  return apiCall(API_ENDPOINTS.SUBMIT_FEEDBACK(studentFormId), {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
};



export const sendEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SEND_EMAIL, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};

export const sendTestSubmissionEmail = async (emailData) => {
  return apiCall(API_ENDPOINTS.SUBMIT_EMAIL_NOTIFICATION, {
    method: 'POST',
    body: JSON.stringify(emailData)
  });
};