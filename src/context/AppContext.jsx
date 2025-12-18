import { useState, useEffect } from 'react';
import { AppContext } from './AppContextDefinition';
import { addApplicant as apiAddApplicant, updateApplicantTest as apiUpdateApplicantTest, updateApplicantFeedback as apiUpdateApplicantFeedback } from '../api';

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

  // Fetch applicants from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('applicants');
    setApplicants(saved ? JSON.parse(saved) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('applicants', JSON.stringify(applicants));
  }, [applicants]);

  const addApplicant = async (applicantData) => {
    try {
      const response = await apiAddApplicant(applicantData);
      const newApplicant = {
        id: Date.now().toString(),
        ...applicantData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
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
