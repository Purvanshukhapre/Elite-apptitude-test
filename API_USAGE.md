# Production-Ready API Guide

## What the API does
The API connects your frontend to a backend server at `https://eliterecruitmentbackend-production.up.railway.app` to save and retrieve data. It includes fallback mechanisms to mock data when the backend is unavailable.

## Available API Functions

### Applicant Functions

#### Get all applicants
```javascript
const applicants = await getApplicants();
```

#### Get applicants by name
```javascript
const applicants = await getApplicantsByName('Aryan');
```

#### Add new applicant
```javascript
const result = await addApplicant(applicantData);
```

### Test & Analytics Functions

#### Get analytics dashboard data
```javascript
const analytics = await getAnalyticsDashboard();
```

#### Submit test results
```javascript
const result = await submitTest(testData);
```

### Feedback Functions

#### Submit feedback (new endpoint)
```javascript
const result = await submitFeedback(feedbackData);
// feedbackData should include: rating (integer), problem1, problem2, problem3, problem4, problem5 (all as strings)
```

#### Get all feedback (new endpoint)
```javascript
const feedback = await getAllFeedback();
```

## Error Handling

All API functions may throw errors, so always use try/catch:

```javascript
try {
  const feedback = await getAllFeedback();
  console.log(feedback);
} catch (error) {
  console.error('Error fetching feedback:', error);
}
```

## Production Features

- **Backend Integration**: Connects to the live backend at Railway
- **Fallback System**: Automatically falls back to mock data if backend is unavailable
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Includes loading indicators for better UX
- **CORS Support**: Handles cross-origin requests properly

## New Feedback Endpoints

The website now supports two new feedback endpoints:
- POST `/feedback/submit` - Submit user feedback
- GET `/feedback/all` - Get all feedback for admin dashboard