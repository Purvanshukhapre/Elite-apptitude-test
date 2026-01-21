// API Service Import
import {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiCall,
  getApplicants,
  getApplicantById,
  addApplicant,
  updateApplicantTest,
  updateApplicantFeedback,
  submitTest,
  submitQuestions,
  submitFeedback,
  submitResume,
  getAllFeedback,
  getAllTestResults,
  sendEmail,
  deleteApplicantById,
  getTestResultById,
  sendTestSubmissionEmail
} from './services/apiService';

// Named exports for individual functions
export {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiCall,
  getApplicants,
  getApplicantById,
  addApplicant,
  updateApplicantTest,
  updateApplicantFeedback,
  submitTest,
  submitQuestions,
  submitFeedback,
  submitResume,
  getAllFeedback,
  getAllTestResults,
  sendEmail,
  deleteApplicantById,
  getTestResultById,
  sendTestSubmissionEmail
};

// Export centralized API functions
// Note: getApplicantById from utils/api is not exported as it's not used
// Only export functions from utils/api that are not already exported from services/apiService
export { } from './utils/api';