import { useState, useCallback } from 'react';
import { submitFeedback, getAllFeedback } from '../utils/api';

// Custom hook for feedback data operations
export const useFeedbackData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit feedback
  const submitFeedbackData = useCallback(async (feedbackData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await submitFeedback(feedbackData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all feedback
  const fetchAllFeedback = useCallback(async () => {
    try {
      return await getAllFeedback();
    } catch {
      return [];
    }
  }, []);

  return {
    submitFeedbackData,
    fetchAllFeedback,
    loading,
    error
  };
};