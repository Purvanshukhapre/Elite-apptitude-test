import { useState, useCallback, useRef } from 'react';
import { AppContext } from './AppContextDefinition';
import { addApplicant as apiAddApplicant, updateApplicantTest as apiUpdateApplicantTest, updateApplicantFeedback as apiUpdateApplicantFeedback, getApplicants as apiGetApplicants, getAllTestResults, getAllFeedback } from '../api';

export const AppProvider = ({ children }) => {
  const [applicants, setApplicants] = useState([]);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'hr'
  const [loading] = useState(false);
  const refreshApplicantsRef = useRef(false);

  const refreshApplicants = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (refreshApplicantsRef.current) {
      return applicants;
    }
    
    refreshApplicantsRef.current = true;
    
    try {
      
      // Fetch all applicants from the backend along with test results and feedback
      const [apiApplicants, testResults, feedbackResults] = await Promise.all([
        apiGetApplicants().catch((error) => {
          console.error('Error in apiGetApplicants:', error);
          return [];
        }),
        getAllTestResults().catch((error) => {
          console.error('Error in getAllTestResults:', error);
          return [];
        }),
        getAllFeedback().catch((error) => {
          console.error('Error in getAllFeedback:', error);
          return [];
        })
      ]);
      
      const combinedApplicants = apiApplicants.map(applicant => {
        // 🔥 CRITICAL: Store the original applicant ID before any data merging
        const originalApplicantId = applicant.id;
        const originalApplicantStudentFormId = applicant.studentFormId;
        
        // Find test result by matching ID first, then by email, then by name
        const testResult = testResults.find(result => 
          // Priority 1: Match by ID if available
          (result.studentFormId && applicant.studentFormId && result.studentFormId === applicant.studentFormId) ||
          (result.id && applicant.id && result.id === applicant.id) ||
          // Priority 2: Match by email
          (result.email && applicant.permanentEmail && result.email.toLowerCase() === applicant.permanentEmail.toLowerCase()) ||
          (result.email && applicant.email && result.email.toLowerCase() === applicant.email.toLowerCase()) ||
          // Priority 3: Match by name as fallback
          (result.fullName && applicant.fullName && result.fullName.toLowerCase() === applicant.fullName.toLowerCase()) ||
          (result.name && applicant.fullName && result.name.toLowerCase() === applicant.fullName.toLowerCase())
        );
        
        // Find feedback by matching ID first, then by email, then by name
        const feedback = feedbackResults.find(f => 
          // Priority 1: Match by ID if available
          (f.studentFormId && applicant.studentFormId && f.studentFormId === applicant.studentFormId) ||
          (f.id && applicant.id && f.id === applicant.id) ||
          // Priority 2: Match by email
          (f.email && applicant.permanentEmail && f.email.toLowerCase() === applicant.permanentEmail.toLowerCase()) ||
          (f.email && applicant.email && f.email.toLowerCase() === applicant.email.toLowerCase()) ||
          // Priority 3: Match by name as fallback
          (f.fullName === applicant.fullName || f.name === applicant.fullName)
        );
        
        // 🔥 CRITICAL: Preserve the original applicant ID and never let it be overwritten
        return {
          ...applicant,
          ...testResult,
          feedback,
          // 🔥 ENSURE ORIGINAL ID IS PRESERVED - THIS IS THE CANONICAL SOURCE
          id: originalApplicantId,
          studentFormId: originalApplicantStudentFormId,
          isTestCompleted: !!testResult,
          testCompletedAt: testResult?.submittedAt || testResult?.createdAt || applicant.testCompletedAt,
          correctAnswer: testResult?.correctAnswer || testResult?.correctAnswers || applicant.correctAnswer,
          score: testResult?.score || applicant.score,
          percentage: testResult?.percentage || testResult?.overallPercentage || applicant.percentage,
          rating: feedback?.rating || applicant.rating,
          feedbackSubmittedAt: feedback?.submittedAt || feedback?.createdAt
        };
      });
      
      
      setApplicants(combinedApplicants);
      return combinedApplicants;
    } catch (error) {
      console.error('Error in refreshApplicants:', error);
      return applicants;
    } finally {
      // Reset the flag after completion
      refreshApplicantsRef.current = false;
    }
  }, [apiGetApplicants, getAllTestResults, getAllFeedback, setApplicants, applicants]);

  const addApplicant = useCallback(async (formData) => {
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
      
      // Handle API response containing studentFormId and questions
      if (result && result.studentFormId) {
        if (result.testData && Array.isArray(result.testData)) {
          setTestQuestions(result.testData);
        } else {
          setTestQuestions([]);
        }
      } else if (result && Array.isArray(result)) {
        setTestQuestions(result);
      } else if (result && result.questions && Array.isArray(result.questions)) {
        setTestQuestions(result.questions);
      } else if (result && result.data && Array.isArray(result.data)) {
        setTestQuestions(result.data);
      } else {
        // No questions available from API
        setTestQuestions([]);
      }

      // Add the applicant to the state
      const newApplicant = {
        id: result.id || result._id || Date.now().toString(),
        // Include studentFormId from the registration API response if available
        studentFormId: result.studentFormId || result.id || result._id || Date.now().toString(),
        ...applicantData,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        // Include resume in the applicant data for reference
        resume
      };
      
      setApplicants(prev => [...prev, newApplicant]);
            
      // Update currentApplicant to the new applicant with studentFormId
      setCurrentApplicant(newApplicant);
            
      // Return the actual result from the API which may contain questions
      // Prefer the newApplicant object which contains the ID
      return newApplicant || result;
    } catch {
      // No questions available from API
      setTestQuestions([]);
      // Return a basic applicant object to continue with the flow
      const newApplicant = {
        id: Date.now().toString(),
        studentFormId: Date.now().toString(), // Use same ID as fallback
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      setApplicants(prev => [...prev, newApplicant]);
      setCurrentApplicant(newApplicant);
      return newApplicant;
    }
  }, [apiAddApplicant, setTestQuestions, setApplicants, setCurrentApplicant]);

  const updateApplicantTest = useCallback(async (applicantId, testData) => {
    // Define the update logic as a separate function to avoid duplication
    const updateApplicantData = (applicantsList) => {
      return applicantsList.map(app => 
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
      );
    };
    
    try {
      await apiUpdateApplicantTest(applicantId, testData);
      setApplicants(prev => updateApplicantData(prev));
    } catch {
      // Fallback to local storage
      setApplicants(prev => updateApplicantData(prev));
    }
  }, [apiUpdateApplicantTest, setApplicants, applicants]);

  const updateApplicantFeedback = useCallback(async (applicantId, feedback) => {
    // Define the update logic as a separate function to avoid duplication
    const updateApplicantData = (applicantsList) => {
      return applicantsList.map(app => 
        app.id === applicantId 
          ? { ...app, feedback, feedbackSubmittedAt: new Date().toISOString() }
          : app
      );
    };
    
    try {
      await apiUpdateApplicantFeedback(applicantId, feedback);
      setApplicants(prev => updateApplicantData(prev));
    } catch {
      // Fallback to local storage
      setApplicants(prev => updateApplicantData(prev));
    }
  }, [apiUpdateApplicantFeedback, setApplicants, applicants]);

  const adminLogin = useCallback((username, password) => {
    // Simple authentication - in production, use proper backend authentication
    if (username === 'admin' && password === 'elite@associate') {
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      return true;
    } else if (username === 'elite' && password === 'eliteassociate123') {  // HR credentials
      setIsAdminAuthenticated(true);
      setUserRole('hr');
      return true;
    }
    return false;
  }, [setIsAdminAuthenticated, setUserRole]);

  const adminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
  }, [setIsAdminAuthenticated]);

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
    userRole,  // Add user role to context
    adminLogin,
    adminLogout,
    refreshApplicants
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};