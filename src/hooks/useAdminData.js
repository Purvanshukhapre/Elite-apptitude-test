import { useState, useCallback } from 'react';
import { useApp } from '../context/useApp';
import { getAllFeedback, getAllTestResults } from '../utils/api';

// Custom hook for admin data fetching
export const useAdminData = () => {
  const { refreshApplicants: contextRefreshApplicants } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized function to refresh all admin data
  const refreshAllData = useCallback(async () => {
    if (!contextRefreshApplicants) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Refresh applicants data from API
      await contextRefreshApplicants();
    } catch (_error) {
      setError(_error.message);
    } finally {
      setLoading(false);
    }
  }, [contextRefreshApplicants]);

  // Fetch feedback data
  const fetchFeedback = useCallback(async () => {
    try {
      const result = await getAllFeedback();
      return result;
    } catch (error) {
      console.error('Error in fetchFeedback:', error);
      return [];
    }
  }, []);

  // Fetch test results
  const fetchTestResults = useCallback(async () => {
    try {
      const result = await getAllTestResults();
      return result;
    } catch (error) {
      console.error('Error in fetchTestResults:', error);
      return [];
    }
  }, []);

  return {
    refreshAllData,
    fetchFeedback,
    fetchTestResults,
    loading,
    error
  };
};