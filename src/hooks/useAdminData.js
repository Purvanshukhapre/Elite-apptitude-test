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
      console.log('Calling getAllFeedback API...');
      const result = await getAllFeedback();
      console.log('getAllFeedback API completed, got', Array.isArray(result) ? result.length : 'unknown', 'items');
      return result;
    } catch (error) {
      console.error('Error in fetchFeedback:', error);
      return [];
    }
  }, []);

  // Fetch test results
  const fetchTestResults = useCallback(async () => {
    try {
      console.log('Calling getAllTestResults API...');
      const result = await getAllTestResults();
      console.log('getAllTestResults API completed, got', Array.isArray(result) ? result.length : 'unknown', 'items');
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