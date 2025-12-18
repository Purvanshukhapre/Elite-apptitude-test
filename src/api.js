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

// Mock data for fake APIs
const mockApplicants = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    position: 'Software Engineer',
    submittedAt: '2023-05-15T10:30:00Z',
    status: 'completed',
    testData: {
      score: 85,
      percentage: 85,
      totalQuestions: 10,
      correctAnswers: 8,
      timeTaken: 1200
    }
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    position: 'Product Manager',
    submittedAt: '2023-05-16T14:45:00Z',
    status: 'completed',
    testData: {
      score: 92,
      percentage: 92,
      totalQuestions: 10,
      correctAnswers: 9,
      timeTaken: 1100
    }
  }
];

const mockQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    category: "Geography"
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "Science"
  }
];

const mockAnalytics = {
  totalApplicants: 42,
  averageScore: 78.5,
  passRate: 85.7,
  categoryPerformance: [
    { category: 'Technical', score: 82 },
    { category: 'Aptitude', score: 75 },
    { category: 'Communication', score: 88 }
  ]
};

const mockFeedback = [
  {
    id: '1',
    applicantId: '1',
    rating: 5,
    comment: 'Excellent performance in technical assessment',
    timestamp: '2023-05-15T12:00:00Z'
  }
];

// Utility function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API call function with mock data support
export const apiCall = async (endpoint, options = {}) => {
  // Simulate network delay
  await delay(500);
  
  const url = buildUrl(endpoint);
  
  // For demo purposes, we'll return mock data based on the endpoint
  // In a real implementation, this would make actual HTTP requests
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  try {
    // Mock API responses based on endpoint
    if (endpoint === API_ENDPOINTS.APPLICANTS) {
      if (options.method === 'POST') {
        // Handle adding new applicant
        const newApplicant = JSON.parse(options.body);
        mockApplicants.push({
          ...newApplicant,
          id: String(mockApplicants.length + 1),
          submittedAt: new Date().toISOString()
        });
        return { success: true, data: newApplicant };
      } else {
        // Return all applicants
        return mockApplicants;
      }
    } else if (endpoint.includes('/test-data')) {
      // Handle test data updates
      return { success: true, message: 'Test data updated successfully' };
    } else if (endpoint.includes('/feedback')) {
      // Handle feedback updates
      return { success: true, message: 'Feedback submitted successfully' };
    } else if (endpoint === API_ENDPOINTS.QUESTIONS) {
      return mockQuestions;
    } else if (endpoint === API_ENDPOINTS.SUBMIT_TEST) {
      return { success: true, message: 'Test submitted successfully' };
    } else if (endpoint === API_ENDPOINTS.ANALYTICS_DASHBOARD) {
      return mockAnalytics;
    } else if (endpoint === API_ENDPOINTS.FEEDBACK) {
      return mockFeedback;
    } else {
      // Default response for other endpoints
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    }
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
  addApplicant,
  updateApplicantTest,
  updateApplicantFeedback,
  getQuestions,
  submitTest,
  getAnalyticsDashboard,
  getFeedback,
  submitFeedback
};