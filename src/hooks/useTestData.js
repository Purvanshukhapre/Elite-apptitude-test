import { useState, useCallback } from 'react';
import { submitTest, submitQuestions as submitQuestionsAPI, submitResume } from '../api';

// Custom hook for test data operations
export const useTestData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit test results
  const submitTestResults = useCallback(async (testData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await submitTest(testData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit test questions
  const submitQuestionsWrapper = useCallback(async (questionsData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await submitQuestionsAPI(questionsData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get test questions by email - no-op since we're removing this functionality
  const getQuestionsByEmail = useCallback(async () => {
    // Since we're removing email-based questions API, return empty array
    return [];
  }, []);

  // Send resume with email
  const sendResumeWithEmail = useCallback(async (email, resumeFile) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await submitResume(email, resumeFile);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Submit profile image with email
  const submitProfileImage = useCallback(async (email, profileImageFile) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for profile image upload
      const profileImageData = new FormData();
      profileImageData.append('file', profileImageFile);
      
      // Upload profile image to the API using email in the path
      const response = await fetch(
        `https://eliterecruitmentbackend-production.up.railway.app/image/upload/${email}`,
        {
          method: 'POST',
          body: profileImageData,
          // Don't set Content-Type header - let browser set it with boundary
        }
      );
      
      if (!response.ok) {
        throw new Error(`Profile image upload failed: ${response.status} ${response.statusText}`);
      }
      
      // API returns plain text, not JSON
      const result = await response.text();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submitTestResults,
    submitQuestions: submitQuestionsWrapper,
    getQuestionsByEmail,
    sendResumeWithEmail,
    submitProfileImage,
    loading,
    error
  };
};