// Sample questions for demo - in production, these would come from API
export const sampleQuestions = [
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
  }
];

export const positions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "UI/UX Designer",
  "QA Engineer",
  "Product Manager",
  "Business Analyst"
];
