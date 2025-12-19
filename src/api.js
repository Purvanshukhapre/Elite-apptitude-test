// API Configuration File
// This file contains all API endpoints and configuration
// To switch to production, simply update the API_BASE_URL

// Configuration
export const API_BASE_URL = 'https://eliterecruitmentbackend-production.up.railway.app'; // Change this to your production URL

// API Endpoints
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/auth/student/submit',
  ALL_APPLICANTS: '/applicants',
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
    phone: '+1 (555) 123-4567',
    position: 'Software Engineer',
    experience: 'mid',
    education: 'bachelor-computer-science',
    expectedSalary: '$80,000 - $90,000',
    resumeLink: '#',
    coverLetter: 'I am excited to apply for the Software Engineer position...',
    submittedAt: '2023-05-15T10:30:00Z',
    status: 'completed',
    testData: {
      score: 85,
      percentage: 85,
      totalQuestions: 10,
      correctAnswers: 8,
      timeTaken: 1200,
      timeSpent: 1200,
      overallPercentage: 85,
      answers: {
        '1': { isCorrect: true, timeSpent: 120 },
        '2': { isCorrect: false, timeSpent: 90 },
        '3': { isCorrect: true, timeSpent: 75 },
        '4': { isCorrect: true, timeSpent: 110 },
        '5': { isCorrect: false, timeSpent: 85 },
        '6': { isCorrect: true, timeSpent: 95 },
        '7': { isCorrect: true, timeSpent: 100 },
        '8': { isCorrect: true, timeSpent: 130 },
        '9': { isCorrect: false, timeSpent: 80 },
        '10': { isCorrect: true, timeSpent: 115 }
      }
    },
    testCompletedAt: '2023-05-15T11:00:00Z',
    feedback: {
      overallRating: 4,
      testDifficulty: 'Medium',
      wouldRecommend: 'Yes',
      platformExperience: 'Good',
      improvements: 'Add more coding challenges',
      comments: 'Well-structured test'
    },
    feedbackSubmittedAt: '2023-05-15T11:30:00Z'
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    position: 'Product Manager',
    experience: 'senior',
    education: 'master-business-administration',
    expectedSalary: '$90,000 - $110,000',
    resumeLink: '#',
    coverLetter: 'With over 5 years of product management experience...',
    submittedAt: '2023-05-16T14:45:00Z',
    status: 'completed',
    testData: {
      score: 92,
      percentage: 92,
      totalQuestions: 10,
      correctAnswers: 9,
      timeTaken: 1100,
      timeSpent: 1100,
      overallPercentage: 92,
      answers: {
        '1': { isCorrect: true, timeSpent: 110 },
        '2': { isCorrect: true, timeSpent: 85 },
        '3': { isCorrect: true, timeSpent: 70 },
        '4': { isCorrect: false, timeSpent: 95 },
        '5': { isCorrect: true, timeSpent: 80 },
        '6': { isCorrect: true, timeSpent: 100 },
        '7': { isCorrect: true, timeSpent: 90 },
        '8': { isCorrect: true, timeSpent: 125 },
        '9': { isCorrect: true, timeSpent: 75 },
        '10': { isCorrect: true, timeSpent: 120 }
      }
    },
    testCompletedAt: '2023-05-16T15:15:00Z',
    feedback: {
      overallRating: 5,
      testDifficulty: 'Challenging',
      wouldRecommend: 'Yes',
      platformExperience: 'Excellent',
      improvements: 'None',
      comments: 'Perfect balance of theory and practical questions'
    },
    feedbackSubmittedAt: '2023-05-16T15:45:00Z'
  },
  {
    id: '3',
    fullName: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '+1 (555) 456-7890',
    position: 'Data Scientist',
    experience: 'entry',
    education: 'phd-data-science',
    expectedSalary: '$70,000 - $85,000',
    resumeLink: '#',
    coverLetter: 'Recent PhD graduate with expertise in machine learning...',
    submittedAt: '2023-05-17T09:15:00Z',
    status: 'completed',
    testData: {
      score: 78,
      percentage: 78,
      totalQuestions: 10,
      correctAnswers: 7,
      timeTaken: 1300,
      timeSpent: 1300,
      overallPercentage: 78,
      answers: {
        '1': { isCorrect: true, timeSpent: 140 },
        '2': { isCorrect: true, timeSpent: 95 },
        '3': { isCorrect: false, timeSpent: 85 },
        '4': { isCorrect: true, timeSpent: 120 },
        '5': { isCorrect: true, timeSpent: 100 },
        '6': { isCorrect: false, timeSpent: 110 },
        '7': { isCorrect: true, timeSpent: 90 },
        '8': { isCorrect: true, timeSpent: 135 },
        '9': { isCorrect: false, timeSpent: 80 },
        '10': { isCorrect: true, timeSpent: 105 }
      }
    },
    testCompletedAt: '2023-05-17T09:45:00Z',
    feedback: {
      overallRating: 3,
      testDifficulty: 'Hard',
      wouldRecommend: 'Yes',
      platformExperience: 'Good',
      improvements: 'More statistics questions',
      comments: 'Interesting variety of questions'
    },
    feedbackSubmittedAt: '2023-05-17T10:15:00Z'
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
    credentials: 'include',
    ...options
  };
  
  try {
    // Mock API responses based on endpoint
    if (endpoint === API_ENDPOINTS.APPLICANTS) {
      if (options.method === 'POST') {
        // For the real API, we'll make an actual request
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...defaultOptions.headers
            },
            body: options.body,
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data;
        } catch (fetchError) {
          // If CORS error occurs, throw the error to be handled by caller
          console.error('Failed to submit applicant data:', fetchError);
          throw fetchError;
        }
      } else {
        // Handle GET requests for applicants
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...defaultOptions.headers
            },
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return data;
        } catch (fetchError) {
          // If CORS error occurs, throw the error to be handled by caller
          console.error('Failed to fetch applicants:', fetchError);
          throw fetchError;
        }
      }
    } else if (endpoint === API_ENDPOINTS.ALL_APPLICANTS) {
      // Handle GET requests for all applicants
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...defaultOptions.headers
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (fetchError) {
        // If CORS error occurs, return mock data as fallback
        console.warn('CORS error or network issue, using mock data as fallback:', fetchError);
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
      try {
        const response = await fetch(url, {
          ...defaultOptions,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (fetchError) {
        // If CORS error occurs, re-throw to be handled by caller
        console.error('API call failed:', fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const getApplicants = async () => {
  return apiCall(API_ENDPOINTS.ALL_APPLICANTS);
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