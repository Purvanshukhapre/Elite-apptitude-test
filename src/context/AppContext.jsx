import { useState, useEffect } from 'react';
import { AppContext } from './AppContextDefinition';
import { addApplicant as apiAddApplicant, updateApplicantTest as apiUpdateApplicantTest, updateApplicantFeedback as apiUpdateApplicantFeedback, getApplicants as apiGetApplicants } from '../api';

export const AppProvider = ({ children }) => {
  const [applicants, setApplicants] = useState([]);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    const saved = localStorage.getItem('adminAuth');
    return saved === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save admin auth state to localStorage
  useEffect(() => {
    localStorage.setItem('adminAuth', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  // Fetch applicants from API or localStorage
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        // Try to fetch from API first
        const apiApplicants = await apiGetApplicants();
        setApplicants(Array.isArray(apiApplicants) ? apiApplicants : []);
      } catch (error) {
        console.error('Failed to fetch applicants from API:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('applicants');
        setApplicants(saved ? JSON.parse(saved) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  useEffect(() => {
    localStorage.setItem('applicants', JSON.stringify(applicants));
  }, [applicants]);

  const addApplicant = async (applicantData) => {
    try {
      const response = await apiAddApplicant(applicantData);
      // The real API should return the created applicant with an ID
      const newApplicant = {
        ...applicantData,
        id: response.id || Date.now().toString(),
        submittedAt: response.submittedAt || new Date().toISOString(),
        status: response.status || 'pending'
      };
      setApplicants(prev => [newApplicant, ...prev]);
      return newApplicant;
    } catch (error) {
      console.error('Failed to add applicant:', error);
      // Fallback to local storage
      const newApplicant = {
        id: Date.now().toString(),
        ...applicantData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      setApplicants(prev => [newApplicant, ...prev]);
      return newApplicant;
    }
  };

  const updateApplicantTest = async (applicantId, testData) => {
    try {
      await apiUpdateApplicantTest(applicantId, testData);
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, testData, testCompletedAt: new Date().toISOString() }
          : app
      ));
    } catch (error) {
      console.error('Failed to update applicant test:', error);
      // Fallback to local storage
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, testData, testCompletedAt: new Date().toISOString() }
          : app
      ));
    }
  };

  const updateApplicantFeedback = async (applicantId, feedback) => {
    try {
      await apiUpdateApplicantFeedback(applicantId, feedback);
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, feedback, feedbackSubmittedAt: new Date().toISOString() }
          : app
      ));
    } catch (error) {
      console.error('Failed to update applicant feedback:', error);
      // Fallback to local storage
      setApplicants(prev => prev.map(app => 
        app.id === applicantId 
          ? { ...app, feedback, feedbackSubmittedAt: new Date().toISOString() }
          : app
      ));
    }
  };

  const adminLogin = (username, password) => {
    // Simple authentication - in production, use proper backend authentication
    if (username === 'admin' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  const value = {
    applicants,
    loading,
    error,
    currentApplicant,
    setCurrentApplicant,
    addApplicant,
    updateApplicantTest,
    updateApplicantFeedback,
    isAdminAuthenticated,
    adminLogin,
    adminLogout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
