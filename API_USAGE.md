# API Configuration and Usage Guide

## Overview
This project uses a centralized API configuration system that makes it easy to switch between different environments (development, staging, production) by simply changing the base URL.

## Configuration File
The API configuration is located at `src/api.js` and contains:

1. **Base URL Configuration**
2. **Endpoint Definitions**
3. **Utility Functions**
4. **Specific API Methods**

## How to Use

### 1. Changing the Base URL
To switch to your production API, simply update the `API_BASE_URL` constant:

```javascript
// In src/api.js
export const API_BASE_URL = 'https://your-production-domain.com/api';
```

### 2. Using API Endpoints
Import the API functions in your components:

```javascript
import { getApplicants, addApplicant, updateApplicantTest } from '../api';

// Example usage
const fetchData = async () => {
  try {
    const applicants = await getApplicants();
    console.log(applicants);
  } catch (error) {
    console.error('Failed to fetch applicants:', error);
  }
};
```

### 3. Available API Methods
- `getApplicants()` - Fetch all applicants
- `getApplicantById(id)` - Fetch a specific applicant
- `addApplicant(data)` - Add a new applicant
- `updateApplicantTest(applicantId, testData)` - Update applicant test data
- `updateApplicantFeedback(applicantId, feedback)` - Update applicant feedback
- `getQuestions()` - Fetch test questions
- `submitTest(testData)` - Submit test results
- `getAnalyticsDashboard()` - Fetch analytics data
- `getFeedback()` - Fetch feedback data
- `submitFeedback(feedbackData)` - Submit feedback

### 4. Custom API Calls
For custom API endpoints, use the `apiCall` function:

```javascript
import { apiCall, API_ENDPOINTS } from '../api';

// Example custom call
const customCall = async () => {
  try {
    const result = await apiCall('/custom-endpoint', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' })
    });
    return result;
  } catch (error) {
    console.error('Custom call failed:', error);
  }
};
```

## Endpoint Structure
All endpoints are defined in the `API_ENDPOINTS` object:

```javascript
export const API_ENDPOINTS = {
  // Applicants
  APPLICANTS: '/applicants',
  APPLICANT_BY_ID: (id) => `/applicants/${id}`,
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
```

## Error Handling
The API functions include built-in error handling with fallback to localStorage when API calls fail. This ensures the application remains functional even when the backend is unavailable.

## Best Practices
1. Always use the provided API functions instead of direct fetch calls
2. Update `API_BASE_URL` when deploying to different environments
3. Add new endpoints to the `API_ENDPOINTS` object for consistency
4. Handle errors appropriately in your components
5. Use async/await for API calls to ensure proper error handling

## Example Implementation
Here's a complete example of how to use the API in a React component:

```javascript
import { useState, useEffect } from 'react';
import { getApplicants, addApplicant } from '../api';

const MyComponent = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await getApplicants();
      setApplicants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplicant = async (applicantData) => {
    try {
      const newApplicant = await addApplicant(applicantData);
      setApplicants(prev => [newApplicant, ...prev]);
    } catch (err) {
      console.error('Failed to add applicant:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Render applicants */}
    </div>
  );
};
```