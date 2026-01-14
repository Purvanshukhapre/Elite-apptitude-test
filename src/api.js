// API Service Import
import {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiCall,
  getApplicants,
  getApplicantsByName,
  addApplicant,
  updateApplicantTest,
  updateApplicantFeedback,
  submitTest,
  calculateCorrectAnswers,
  submitFeedback,
  getAllFeedback,
  getAllTestResults,
  getTestQuestionsByEmail,
  getAllTestQuestions,
  sendEmail,
  sendTestSubmissionEmail,
  sendResumeWithEmail,
  getResumeByApplicantId  // Changed from getResumeByEmail to getResumeByApplicantId
} from './services/apiService';

// Named exports for individual functions
export {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiCall,
  getApplicants,
  getApplicantsByName,
  addApplicant,
  updateApplicantTest,
  updateApplicantFeedback,
  submitTest,
  calculateCorrectAnswers,
  submitFeedback,
  getAllFeedback,
  getAllTestResults,
  getTestQuestionsByEmail,
  getAllTestQuestions,
  sendEmail,
  sendTestSubmissionEmail,
  sendResumeWithEmail,
  getResumeByApplicantId  // Changed from getResumeByEmail to getResumeByApplicantId
};


// Mock data for fake APIs
export const mockApplicants = [
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
    correctAnswer: 8,
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
    correctAnswer: 9,
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
    correctAnswer: 7,
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

export const mockQuestions = [
  // Easy Questions (5)
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language"
    ],
    correctAnswer: 0,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: 2,
    question: "Which SQL command is used to retrieve data from a database?",
    options: ["GET", "SELECT", "RETRIEVE", "FETCH"],
    correctAnswer: 1,
    category: "Database",
    difficulty: "Easy"
  },
  {
    id: 3,
    question: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Computer Style Sheets",
      "Creative Style Sheets",
      "Colorful Style Sheets"
    ],
    correctAnswer: 0,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: 4,
    question: "Which of the following is NOT a JavaScript data type?",
    options: ["String", "Boolean", "Float", "Undefined"],
    correctAnswer: 2,
    category: "Programming",
    difficulty: "Easy"
  },
  {
    id: 5,
    question: "What is the primary purpose of Git?",
    options: [
      "Version Control",
      "Database Management",
      "Code Compilation",
      "Web Hosting"
    ],
    correctAnswer: 0,
    category: "Tools",
    difficulty: "Easy"
  },

  // Medium Questions (5)
  {
    id: 6,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    category: "Algorithms",
    difficulty: "Medium"
  },
  {
    id: 7,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    category: "Data Structures",
    difficulty: "Medium"
  },
  {
    id: 8,
    question: "In Object-Oriented Programming, what does 'inheritance' mean?",
    options: [
      "Sharing memory between objects",
      "Creating multiple instances",
      "Acquiring properties from parent class",
      "Hiding implementation details"
    ],
    correctAnswer: 2,
    category: "Programming Concepts",
    difficulty: "Medium"
  },
  {
    id: 9,
    question: "What is the output of: console.log(typeof null)?",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: 2,
    category: "Programming",
    difficulty: "Medium"
  },
  {
    id: 10,
    question: "Which of the following is a Python web framework?",
    options: ["React", "Angular", "Django", "Vue"],
    correctAnswer: 2,
    category: "Programming",
    difficulty: "Medium"
  },

  // Hard Questions (5)
  {
    id: 11,
    question: "What is the difference between == and === in JavaScript?",
    options: [
      "== compares values, === compares values and types",
      "== compares types, === compares values",
      "Both work the same way",
      "== is deprecated, === is the new standard"
    ],
    correctAnswer: 0,
    category: "Programming",
    difficulty: "Hard"
  },
  {
    id: 12,
    question: "What is the purpose of a closure in JavaScript?",
    options: [
      "To encapsulate private variables and methods",
      "To close HTML tags",
      "To terminate loops",
      "To compress code"
    ],
    correctAnswer: 0,
    category: "Programming",
    difficulty: "Hard"
  },
  {
    id: 13,
    question: "What is the CAP theorem in distributed systems?",
    options: [
      "Consistency, Availability, Partition tolerance - can only guarantee two",
      "Capacity, Accuracy, Performance - system design principles",
      "Centralization, Automation, Parallelization - deployment strategy",
      "Compression, Authentication, Privacy - security measures"
    ],
    correctAnswer: 0,
    category: "Distributed Systems",
    difficulty: "Hard"
  },
  {
    id: 14,
    question: "What is the time complexity of merge sort?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    correctAnswer: 2,
    category: "Algorithms",
    difficulty: "Hard"
  },
  {
    id: 15,
    question: "What is the difference between TCP and UDP?",
    options: [
      "TCP is connection-oriented and reliable, UDP is connectionless and unreliable",
      "TCP is faster than UDP",
      "UDP is used for web browsing, TCP for streaming",
      "There is no difference, they are the same protocol"
    ],
    correctAnswer: 0,
    category: "Networking",
    difficulty: "Hard"
  },
  // Additional Questions (16-26)
  {
    id: 16,
    question: "What is the time complexity of accessing an element in an array?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correctAnswer: 2,
    category: "Algorithms",
    difficulty: "Easy"
  },
  {
    id: 17,
    question: "Which of the following is a valid CSS property for centering an element horizontally?",
    options: ["center: auto", "margin: 0 auto", "text-align: center", "align: center"],
    correctAnswer: 1,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: 18,
    question: "What does API stand for?",
    options: ["Application Programming Interface", "Advanced Program Implementation", "Automated Processing Interface", "Application Process Integration"],
    correctAnswer: 0,
    category: "General",
    difficulty: "Easy"
  },
  {
    id: 19,
    question: "Which of the following is NOT a JavaScript framework?",
    options: ["React", "Angular", "Vue.js", "SASS"],
    correctAnswer: 3,
    category: "Programming",
    difficulty: "Medium"
  },
  {
    id: 20,
    question: "What is the purpose of an index in a database?",
    options: ["To store data", "To improve query performance", "To encrypt data", "To backup data"],
    correctAnswer: 1,
    category: "Database",
    difficulty: "Medium"
  },
  {
    id: 21,
    question: "Which HTTP status code indicates 'Not Found'?",
    options: ["200", "404", "500", "301"],
    correctAnswer: 1,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: 22,
    question: "What is the main advantage of using version control?",
    options: ["Faster compilation", "Better UI design", "Track changes and collaborate", "Automatic bug fixing"],
    correctAnswer: 2,
    category: "Tools",
    difficulty: "Easy"
  },
  {
    id: 23,
    question: "Which sorting algorithm has the best average time complexity?",
    options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
    correctAnswer: 1,
    category: "Algorithms",
    difficulty: "Medium"
  },
  {
    id: 24,
    question: "What is the purpose of a constructor in object-oriented programming?",
    options: ["To destroy objects", "To initialize objects", "To copy objects", "To compare objects"],
    correctAnswer: 1,
    category: "Programming Concepts",
    difficulty: "Medium"
  },
  {
    id: 25,
    question: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
    correctAnswer: 2,
    category: "Database",
    difficulty: "Medium"
  },
  {
    id: 26,
    question: "What is the main purpose of a REST API?",
    options: [
      "To provide a standardized way for applications to communicate over HTTP",
      "To store data in a database",
      "To format HTML documents",
      "To encrypt network traffic"
    ],
    correctAnswer: 0,
    category: "Web Development",
    difficulty: "Hard"
  }
];

const MOCK_ANALYTICS = {
  totalApplicants: 42,
  averageScore: 78.5,
  passRate: 85.7,
  categoryPerformance: [
    { category: 'Technical', score: 82 },
    { category: 'Aptitude', score: 75 },
    { category: 'Communication', score: 88 }
  ]
};

const MOCK_FEEDBACK = [
  {
    id: '1',
    applicantId: '1',
    rating: 5,
    comment: 'Excellent performance in technical assessment',
    timestamp: '2023-05-15T12:00:00Z'
  }
];

// Export the API functions and data
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiCall,
  getApplicants,
  getApplicantsByName,
  addApplicant,
  updateApplicantTest,
  updateApplicantFeedback,
  submitTest,
  calculateCorrectAnswers,
  submitFeedback,
  getAllFeedback,
  getAllTestResults,
  getTestQuestionsByEmail,
  sendEmail,
  sendTestSubmissionEmail,
  mockQuestions,
  mockApplicants
};