import { useState, useEffect } from 'react';
import { AppContext } from './AppContextDefinition';
import { addApplicant as apiAddApplicant, updateApplicantTest as apiUpdateApplicantTest, updateApplicantFeedback as apiUpdateApplicantFeedback, getApplicants as apiGetApplicants, getAllTestResults, getAllFeedback, mockQuestions } from '../api';
// mockQuestions is now properly exported from api.js

export const AppProvider = ({ children }) => {
  const [applicants, setApplicants] = useState([]);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    const saved = localStorage.getItem('adminAuth');
    // Also check if we have a valid admin token
    const hasToken = localStorage.getItem('adminToken');
    return saved === 'true' && !!hasToken;
  });
  const [loading, setLoading] = useState(true);

  // Save admin auth state to localStorage
  useEffect(() => {
    localStorage.setItem('adminAuth', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  // Initialize by fetching applicants, test results, and feedback from API
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const [apiApplicants, testResults, feedbackResults] = await Promise.all([
          apiGetApplicants(),
          getAllTestResults().catch(error => {
            console.error('Failed to fetch test results:', error);
            return [];
          }),
          getAllFeedback().catch(error => {
            console.error('Failed to fetch feedback:', error);
            return [];
          })
        ]);
        
        // Combine applicants with test results and feedback
        const combinedApplicants = apiApplicants.map(applicant => {
          // Find corresponding test result by fullName
          const testResult = testResults.find(result => 
            result.fullName === applicant.fullName || result.name === applicant.fullName
          );
          
          // Find corresponding feedback by fullName or email
          const feedback = feedbackResults.find(f => 
            f.fullName === applicant.fullName || f.name === applicant.fullName || f.email === applicant.permanentEmail
          );
          
          return {
            ...applicant,
            // Add test result data if available
            ...testResult,
            // Add feedback data if available
            feedback,
            // Ensure test completion status is set
            isTestCompleted: !!testResult,
            // Set test completed at date if available
            testCompletedAt: testResult?.submittedAt || testResult?.createdAt || applicant.testCompletedAt,
            // Set correct answers if available
            correctAnswer: testResult?.correctAnswer || testResult?.correctAnswers || applicant.correctAnswer,
            // Set score if available
            score: testResult?.score || applicant.score,
            // Set percentage if available
            percentage: testResult?.percentage || testResult?.overallPercentage || applicant.percentage,
            // Set rating from feedback if available
            rating: feedback?.rating || applicant.rating,
            // Set feedback submitted at date if available
            feedbackSubmittedAt: feedback?.submittedAt || feedback?.createdAt
          };
        });
        
        setApplicants(combinedApplicants);
        // console.log('Applicants loaded from API:', combinedApplicants);
      } catch (error) {
        console.error('Failed to fetch applicants from API:', error);
        // Fallback to localStorage
        const savedApplicants = localStorage.getItem('applicants');
        if (savedApplicants) {
          const parsedApplicants = JSON.parse(savedApplicants);
          // Check if the data contains placeholder data like "ARYAN NAGARDHANKAR" and clear if so
          const hasPlaceholderData = parsedApplicants.some(applicant => 
            applicant.fullName && applicant.fullName.includes('ARYAN') && applicant.fullName.includes('NAGARDHANKAR')
          );
          
          if (hasPlaceholderData) {
            console.warn('Found placeholder data in localStorage, clearing it');
            localStorage.removeItem('applicants');
            setApplicants([]);
          } else {
            setApplicants(parsedApplicants);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicants();
  }, []);

  // Function to refresh applicants from API
  const refreshApplicants = async () => {
    try {
      const [apiApplicants, testResults, feedbackResults] = await Promise.all([
        apiGetApplicants(),
        getAllTestResults().catch(error => {
          console.error('Failed to fetch test results:', error);
          return [];
        }),
        getAllFeedback().catch(error => {
          console.error('Failed to fetch feedback:', error);
          return [];
        })
      ]);
      
      // Combine applicants with test results and feedback
      const combinedApplicants = apiApplicants.map(applicant => {
        // Find corresponding test result by fullName
        const testResult = testResults.find(result => 
          result.fullName === applicant.fullName || result.name === applicant.fullName
        );
        
        // Find corresponding feedback by fullName or email
        const feedback = feedbackResults.find(f => 
          f.fullName === applicant.fullName || f.name === applicant.fullName || f.email === applicant.permanentEmail
        );
        
        return {
          ...applicant,
          // Add test result data if available
          ...testResult,
          // Add feedback data if available
          feedback,
          // Ensure test completion status is set
          isTestCompleted: !!testResult,
          // Set test completed at date if available
          testCompletedAt: testResult?.submittedAt || testResult?.createdAt || applicant.testCompletedAt,
          // Set correct answers if available
          correctAnswer: testResult?.correctAnswer || testResult?.correctAnswers || applicant.correctAnswer,
          // Set score if available
          score: testResult?.score || applicant.score,
          // Set percentage if available
          percentage: testResult?.percentage || testResult?.overallPercentage || applicant.percentage,
          // Set rating from feedback if available
          rating: feedback?.rating || applicant.rating,
          // Set feedback submitted at date if available
          feedbackSubmittedAt: feedback?.submittedAt || feedback?.createdAt
        };
      });
      
      setApplicants(combinedApplicants);
      return combinedApplicants;
    } catch (error) {
      console.error('Failed to refresh applicants from API:', error);
      return applicants; // Return current applicants if refresh fails
    }
  };

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('applicants', JSON.stringify(applicants));
    }
  }, [applicants, loading]);

  const addApplicant = async (formData) => {
    try {
      // Transform the form data to match the expected backend structure
      const applicantData = {
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        postAppliedFor: formData.postAppliedFor,
        referenceName: formData.reference1Name || '',
        dateOfBirth: formData.dateOfBirth,
        age: formData.age || 0,
        maritalStatus: formData.maritalStatus,
        sex: formData.sex,
        linkedInProfile: formData.linkedInProfile || '',
        language: formData.language,
        permanentAddressLine: formData.permanentAddressLine,
        permanentPin: formData.permanentPin,
        permanentPhone: formData.permanentPhone,
        permanentEmail: formData.permanentEmail,
        reference1Name: formData.reference1Name || '',
        reference1Mobile: formData.reference1Mobile || '',
        reference2Name: formData.reference2Name || '',
        reference2Mobile: formData.reference2Mobile || '',
        academicRecords: [
          {
            schoolOrCollege: formData.academicRecords[0].schoolOrCollege,
            boardOrUniversity: formData.academicRecords[0].boardOrUniversity,
            examinationPassed: formData.academicRecords[0].examinationPassed,
            yearOfPassing: parseInt(formData.academicRecords[0].yearOfPassing) || 0,
            mainSubjects: formData.academicRecords[0].mainSubjects,
            percentage: parseFloat(formData.academicRecords[0].percentage) || 0
          }
        ],
        workExperiences: formData.experience !== 'fresher' ? [
          {
            employerName: formData.workExperiences[0].employerName || 'Previous Employer',
            durationFrom: formData.workExperiences[0].durationFrom,
            durationTo: formData.workExperiences[0].durationTo,
            designation: formData.workExperiences[0].designation,
            briefJobProfile: formData.workExperiences[0].briefJobProfile,
            totalSalary: formData.workExperiences[0].totalSalary || 0,
            joiningDate: formData.workExperiences[0].joiningDate,
            lastDate: formData.workExperiences[0].lastDate
          }
        ] : [],
        experienceLevel: formData.experienceLevel,
        yearsOfExperience: formData.experience === 'fresher' ? 0 : (formData.experience === '0-1' ? 1 : 
                   formData.experience === '1-3' ? 2 : 
                   formData.experience === '3-5' ? 4 : 
                   formData.experience === '5-10' ? 7 : 15),
        primarySkills: formData.primarySkills || [],
        secondarySkills: formData.secondarySkills || []
      };

      const result = await apiAddApplicant(applicantData);
      
      // If the result contains questions (from successful API call), update the context
      if (result && Array.isArray(result)) {
        // The API returned questions, store them
        setTestQuestions(result);
        // console.log('Questions received from API:', result);
      } else if (result && result.questions && Array.isArray(result.questions)) {
        // The API returned an object with questions property
        setTestQuestions(result.questions);
        // console.log('Questions received from API:', result.questions);
      } else {
        // Fallback to mock questions if API doesn't return them
        setTestQuestions(mockQuestions);
      }

      // Add the applicant to the state
      const newApplicant = {
        id: result.id || Date.now().toString(),
        ...applicantData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      setApplicants(prev => [...prev, newApplicant]);
      return newApplicant;
    } catch (error) {
      console.error('Failed to add applicant:', error);
      // Even if API call fails, we should return mock questions for the test
      setTestQuestions(mockQuestions);
      // Return a basic applicant object to continue with the flow
      const newApplicant = {
        id: Date.now().toString(),
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      setApplicants(prev => [...prev, newApplicant]);
      return newApplicant;
    }
  };

  const updateApplicantTest = async (applicantId, testData) => {
    try {
      await apiUpdateApplicantTest(applicantId, testData);
      setApplicants(prev => prev.map(app => 
        (app.id === applicantId || app.email === testData.applicantId || app.fullName === testData.applicantName || app.name === testData.applicantName) // Also match by email, name, or fullName if ID doesn't match
          ? { 
              ...app, 
              testData, 
              // Update top-level correctAnswer field if available in testData (handle both correctAnswer and correctAnswers)
              correctAnswer: testData.correctAnswer !== undefined ? testData.correctAnswer : 
                         testData.correctAnswers !== undefined ? testData.correctAnswers : app.correctAnswer,
              // Update other test-related fields
              percentage: testData.percentage !== undefined ? testData.percentage : 
                        testData.overallPercentage !== undefined ? testData.overallPercentage : app.percentage,
              score: testData.score !== undefined ? testData.score : app.score,
              rating: testData.rating !== undefined ? testData.rating : app.rating,
              testCompletedAt: new Date().toISOString(),
              isTestCompleted: true
            }
          : app
      ));
    } catch (error) {
      console.error('Failed to update applicant test:', error);
      // Fallback to local storage
      setApplicants(prev => prev.map(app => 
        (app.id === applicantId || app.email === testData.applicantId || app.fullName === testData.applicantName || app.name === testData.applicantName) // Also match by email, name, or fullName if ID doesn't match
          ? { 
              ...app, 
              testData, 
              // Update top-level correctAnswer field if available in testData (handle both correctAnswer and correctAnswers)
              correctAnswer: testData.correctAnswer !== undefined ? testData.correctAnswer : 
                         testData.correctAnswers !== undefined ? testData.correctAnswers : app.correctAnswer,
              // Update other test-related fields
              percentage: testData.percentage !== undefined ? testData.percentage : 
                        testData.overallPercentage !== undefined ? testData.overallPercentage : app.percentage,
              score: testData.score !== undefined ? testData.score : app.score,
              rating: testData.rating !== undefined ? testData.rating : app.rating,
              testCompletedAt: new Date().toISOString(),
              isTestCompleted: true
            }
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
      // Store a dummy token for API authentication (in production, this would come from the backend)
      localStorage.setItem('adminToken', 'dummy-admin-token-for-development');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    // Clear the admin token on logout
    localStorage.removeItem('adminToken');
  };

  const value = {
    applicants,
    loading,
    currentApplicant,
    setCurrentApplicant,
    testQuestions,
    setTestQuestions,
    addApplicant,
    updateApplicantTest,
    updateApplicantFeedback,
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    refreshApplicants
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
