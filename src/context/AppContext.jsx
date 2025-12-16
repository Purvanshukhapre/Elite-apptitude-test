import { useState, useEffect } from 'react';
import { AppContext } from './AppContextDefinition';

export const AppProvider = ({ children }) => {
  const [applicants, setApplicants] = useState(() => {
    const saved = localStorage.getItem('applicants');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('applicants', JSON.stringify(applicants));
  }, [applicants]);

  const addApplicant = (applicantData) => {
    const newApplicant = {
      id: Date.now().toString(),
      ...applicantData,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setApplicants(prev => [newApplicant, ...prev]);
    return newApplicant;
  };

  const updateApplicantTest = (applicantId, testData) => {
    setApplicants(prev => prev.map(app => 
      app.id === applicantId 
        ? { ...app, testData, testCompletedAt: new Date().toISOString() }
        : app
    ));
  };

  const updateApplicantFeedback = (applicantId, feedback) => {
    setApplicants(prev => prev.map(app => 
      app.id === applicantId 
        ? { ...app, feedback, feedbackSubmittedAt: new Date().toISOString() }
        : app
    ));
  };

  const adminLogin = (username, password) => {
    // Simple authentication - in production, use proper backend authentication
    if (username === 'admin' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const value = {
    applicants,
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
