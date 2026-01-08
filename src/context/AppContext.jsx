import { useState, useEffect } from 'react';
import { AppContext } from './AppContextDefinition';
import { addApplicant as apiAddApplicant, updateApplicantTest as apiUpdateApplicantTest, updateApplicantFeedback as apiUpdateApplicantFeedback, getApplicants as apiGetApplicants, getAllTestResults, getAllFeedback, mockQuestions, getTestQuestionsByEmail as apiGetTestQuestionsByEmail } from '../api';
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
      const { resume, ...formDataWithoutResume } = formData;
      
      const applicantData = {
        fullName: formDataWithoutResume.fullName,
        fatherName: formDataWithoutResume.fatherName,
        postAppliedFor: formDataWithoutResume.postAppliedFor,
        referenceName: formDataWithoutResume.reference1Name || '',
        dateOfBirth: formDataWithoutResume.dateOfBirth,
        age: formDataWithoutResume.age || 0,
        maritalStatus: formDataWithoutResume.maritalStatus,
        sex: formDataWithoutResume.sex,
        linkedInProfile: formDataWithoutResume.linkedInProfile || '',
        language: formDataWithoutResume.language,
        permanentAddressLine: formDataWithoutResume.permanentAddressLine,
        permanentPin: formDataWithoutResume.permanentPin,
        permanentPhone: formDataWithoutResume.permanentPhone,
        permanentEmail: formDataWithoutResume.permanentEmail,
        reference1Name: formDataWithoutResume.reference1Name || '',
        reference1Mobile: formDataWithoutResume.reference1Mobile || '',
        reference2Name: formDataWithoutResume.reference2Name || '',
        reference2Mobile: formDataWithoutResume.reference2Mobile || '',
        academicRecords: [
          {
            schoolOrCollege: formDataWithoutResume.academicRecords[0].schoolOrCollege,
            boardOrUniversity: formDataWithoutResume.academicRecords[0].boardOrUniversity,
            examinationPassed: formDataWithoutResume.academicRecords[0].examinationPassed,
            yearOfPassing: parseInt(formDataWithoutResume.academicRecords[0].yearOfPassing) || 0,
            mainSubjects: formDataWithoutResume.academicRecords[0].mainSubjects,
            percentage: parseFloat(formDataWithoutResume.academicRecords[0].percentage) || 0
          }
        ],
        workExperiences: formDataWithoutResume.experience !== 'fresher' ? [
          {
            employerName: formDataWithoutResume.workExperiences[0].employerName || 'Previous Employer',
            durationFrom: formDataWithoutResume.workExperiences[0].durationFrom,
            durationTo: formDataWithoutResume.workExperiences[0].durationTo,
            designation: formDataWithoutResume.workExperiences[0].designation,
            briefJobProfile: formDataWithoutResume.workExperiences[0].briefJobProfile,
            totalSalary: formDataWithoutResume.workExperiences[0].totalSalary || 0,
            joiningDate: formDataWithoutResume.workExperiences[0].joiningDate,
            lastDate: formDataWithoutResume.workExperiences[0].lastDate
          }
        ] : [],
        experienceLevel: formDataWithoutResume.experienceLevel,
        yearsOfExperience: formDataWithoutResume.experience === 'fresher' ? 0 : (formDataWithoutResume.experience === '0-1' ? 1 : 
                   formDataWithoutResume.experience === '1-3' ? 2 : 
                   formDataWithoutResume.experience === '3-5' ? 4 : 
                   formDataWithoutResume.experience === '5-10' ? 7 : 15),
        primarySkills: formDataWithoutResume.primarySkills || [],
        secondarySkills: formDataWithoutResume.secondarySkills || []
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
      } else if (result && result.data && Array.isArray(result.data)) {
        // Some APIs return questions in a data property
        setTestQuestions(result.data);
        // console.log('Questions received from API data:', result.data);
      } else {
        // If the API doesn't return questions after submission, try to fetch them separately
        try {
          // Attempt to fetch questions by email after successful form submission
          if (formDataWithoutResume.permanentEmail) {
            const questionsResult = await apiGetTestQuestionsByEmail(formDataWithoutResume.permanentEmail);
            if (questionsResult && Array.isArray(questionsResult)) {
              setTestQuestions(questionsResult);
              // console.log('Questions received from email API:', questionsResult);
            } else {
              // Fallback to mock questions if API doesn't return them
              setTestQuestions(mockQuestions);
            }
          } else {
            // Fallback to mock questions if API doesn't return them
            setTestQuestions(mockQuestions);
          }
        } catch (questionsError) {
          console.error('Failed to fetch questions after form submission:', questionsError);
          // Fallback to mock questions if API doesn't return them
          setTestQuestions(mockQuestions);
        }
      }

      // Add the applicant to the state
      const newApplicant = {
        id: result.id || Date.now().toString(),
        ...applicantData,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        // Include resume in the applicant data for reference
        resume
      };
      
      setApplicants(prev => [...prev, newApplicant]);
      
      // Return the actual result from the API which may contain questions
      return result || newApplicant;
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
        (app.id === applicantId || 
         (testData.email && app.permanentEmail === testData.email) || 
         (testData.applicantId && app.id === testData.applicantId) ||
         (testData.applicantName && app.fullName === testData.applicantName)) // More specific matching to prevent incorrect updates
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
        (app.id === applicantId || 
         (testData.email && app.permanentEmail === testData.email) || 
         (testData.applicantId && app.id === testData.applicantId) ||
         (testData.applicantName && app.fullName === testData.applicantName)) // More specific matching to prevent incorrect updates
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
