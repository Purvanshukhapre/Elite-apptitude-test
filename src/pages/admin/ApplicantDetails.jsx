import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getTestQuestionsByEmail, getApplicantsByName, getAllTestResults, getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';

const ApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applicants } = useApp();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    const fetchApplicantData = async () => {
      try {
        const decodedId = decodeURIComponent(id);
        
        // Fetch feedback data
        let feedbackData = [];
        try {
          feedbackData = await getAllFeedback();
        } catch (error) {
          console.error('Error fetching feedback:', error);
          feedbackData = [];
        }
        
        // First, try to find the applicant from context using the index or name
        let localApplicant = null;
        
        // Try to parse as index first
        const index = parseInt(decodedId, 10);
        if (!isNaN(index) && index >= 0 && index < applicants.length) {
          localApplicant = applicants[index];
        }
        
        // If not found by index, try to find by name
        if (!localApplicant) {
          localApplicant = applicants.find(app => 
            app.fullName === decodedId ||
            app.name === decodedId ||
            app.fullName?.toLowerCase() === decodedId.toLowerCase() ||
            app.name?.toLowerCase() === decodedId.toLowerCase()
          );
        }
        
        // If we found the applicant locally, try to fetch updated data from API using their name
        if (localApplicant && localApplicant.fullName) {
          try {
            const data = await getApplicantsByName(localApplicant.fullName);
            
            // If the API returns an array, take the first applicant
            const applicantData = Array.isArray(data) ? data[0] : data;
            
            if (applicantData) {
              // Fetch test results to get correct answer count
              try {
                const testResults = await getAllTestResults();
                const applicantTestResult = testResults.find(result => 
                  result.fullName?.toLowerCase() === applicantData.fullName?.toLowerCase()
                );
                
                // Find feedback for this applicant
                const applicantFeedback = feedbackData.find(feedback => 
                  feedback.email === applicantData.permanentEmail || 
                  feedback.email === applicantData.email ||
                  feedback.name === applicantData.fullName ||
                  feedback.fullName === applicantData.fullName
                );
                
                // Add test result and feedback data to the applicant
                const updatedApplicant = {
                  ...applicantData,
                  testResult: applicantTestResult || null,
                  correctAnswer: applicantTestResult?.correctAnswer || applicantData.correctAnswer,
                  overallRating: applicantFeedback ? applicantFeedback.rating : undefined
                };
                
                setApplicant(updatedApplicant);
                
                // Optionally fetch questions data if available
                const email = updatedApplicant.permanentEmail || updatedApplicant.email;
                if (email) {
                  setQuestionsLoading(true);
                  try {
                    // console.log('Fetching questions for email:', email);
                    const questionsData = await getTestQuestionsByEmail(email);
                    // console.log('Received questions data:', questionsData);
                    setApplicant(prev => ({
                      ...prev,
                      questionsData
                    }));
                  } catch (questionsError) {
                    console.error('Could not fetch questions data:', questionsError);
                    // Silently fail - questions data is optional
                  } finally {
                    setQuestionsLoading(false);
                  }
                } else {
                  setQuestionsLoading(false);
                }
              } catch (testResultsError) {
                console.warn('Could not fetch test results:', testResultsError);
                // Find feedback for this applicant
                const applicantFeedback = feedbackData.find(feedback => 
                  feedback.email === applicantData.permanentEmail || 
                  feedback.email === applicantData.email ||
                  feedback.name === applicantData.fullName ||
                  feedback.fullName === applicantData.fullName
                );
                
                // Set the applicant without test results but with feedback
                const updatedApplicant = {
                  ...applicantData,
                  overallRating: applicantFeedback ? applicantFeedback.rating : undefined
                };
                
                setApplicant(updatedApplicant);
                
                // Optionally fetch questions data if available
                const email = updatedApplicant.permanentEmail || updatedApplicant.email;
                if (email) {
                  setQuestionsLoading(true);
                  try {
                    console.log('Fetching questions for email:', email);
                    const questionsData = await getTestQuestionsByEmail(email);
                    console.log('Received questions data:', questionsData);
                    setApplicant(prev => ({
                      ...prev,
                      questionsData
                    }));
                  } catch (questionsError) {
                    console.error('Could not fetch questions data:', questionsError);
                    // Silently fail - questions data is optional
                  } finally {
                    setQuestionsLoading(false);
                  }
                } else {
                  setQuestionsLoading(false);
                }
              }
            } else {
              // Find feedback for this applicant
              const applicantFeedback = feedbackData.find(feedback => 
                feedback.email === localApplicant.permanentEmail || 
                feedback.email === localApplicant.email ||
                feedback.name === localApplicant.fullName ||
                feedback.fullName === localApplicant.fullName
              );
                          
              // Set the applicant with feedback data
              const updatedApplicant = {
                ...localApplicant,
                overallRating: applicantFeedback ? applicantFeedback.rating : undefined
              };
                          
              setApplicant(updatedApplicant);
              
              // Optionally fetch questions data if available
              const email = updatedApplicant.permanentEmail || updatedApplicant.email;
              if (email) {
                setQuestionsLoading(true);
                try {
                  console.log('Fetching questions for email:', email);
                  const questionsData = await getTestQuestionsByEmail(email);
                  console.log('Received questions data:', questionsData);
                  setApplicant(prev => ({
                    ...prev,
                    questionsData
                  }));
                } catch (questionsError) {
                  console.error('Could not fetch questions data:', questionsError);
                  // Silently fail - questions data is optional
                } finally {
                  setQuestionsLoading(false);
                }
              } else {
                setQuestionsLoading(false);
              }
            }
          } catch (apiError) {
            console.error('Error fetching applicant data from API:', apiError);
            // Find feedback for this applicant
            const applicantFeedback = feedbackData.find(feedback => 
              feedback.email === localApplicant.permanentEmail || 
              feedback.email === localApplicant.email ||
              feedback.name === localApplicant.fullName ||
              feedback.fullName === localApplicant.fullName
            );
            
            // Set the applicant with feedback data
            const updatedApplicant = {
              ...localApplicant,
              overallRating: applicantFeedback ? applicantFeedback.rating : undefined
            };
            
            setApplicant(updatedApplicant);
            
            // Optionally fetch questions data if available
            const email = updatedApplicant.permanentEmail || updatedApplicant.email;
            if (email) {
              setQuestionsLoading(true);
              try {
                console.log('Fetching questions for email:', email);
                const questionsData = await getTestQuestionsByEmail(email);
                console.log('Received questions data:', questionsData);
                setApplicant(prev => ({
                  ...prev,
                  questionsData
                }));
              } catch (questionsError) {
                console.error('Could not fetch questions data:', questionsError);
                // Silently fail - questions data is optional
              } finally {
                setQuestionsLoading(false);
              }
            } else {
              setQuestionsLoading(false);
            }
          }
        } else if (localApplicant) {
          // If we only have local data (no fullName to query API), use it
          // Find feedback for this applicant
          const applicantFeedback = feedbackData.find(feedback => 
            feedback.email === localApplicant.permanentEmail || 
            feedback.email === localApplicant.email ||
            feedback.name === localApplicant.fullName ||
            feedback.fullName === localApplicant.fullName
          );
          
          // Set the applicant with feedback data
          const updatedApplicant = {
            ...localApplicant,
            overallRating: applicantFeedback ? applicantFeedback.rating : undefined
          };
          
          setApplicant(updatedApplicant);
          
          // Optionally fetch questions data if available
          const email = updatedApplicant.permanentEmail || updatedApplicant.email;
          if (email) {
            setQuestionsLoading(true);
            try {
              console.log('Fetching questions for email:', email);
              const questionsData = await getTestQuestionsByEmail(email);
              console.log('Received questions data:', questionsData);
              setApplicant(prev => ({
                ...prev,
                questionsData
              }));
            } catch (questionsError) {
              console.error('Could not fetch questions data:', questionsError);
              // Silently fail - questions data is optional
            } finally {
              setQuestionsLoading(false);
            }
          } else {
            setQuestionsLoading(false);
          }
        } else {
          // If we couldn't find the applicant locally and the ID is not a valid name, set to null
          // This prevents unnecessary API calls with index values like "0", "1", etc.
          setApplicant(null);
          setQuestionsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching applicant data:', error);
        setApplicant(null);
        setQuestionsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantData();
  }, [id, applicants]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Applicant Not Found</h2>
        <p className="text-gray-600 mb-6">The applicant you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/admin/modern/applicants')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Back to Applicants
        </button>
      </div>
    );
  }

  // Helper function to extract numeric score
  const getNumericScore = (applicant) => {
    // Use test result data if available (from /result/all API) - prioritize test results over feedback
    if (applicant.testResult && applicant.testResult.correctAnswer !== undefined) {
      const totalQuestions = 15; // Fixed total as per API
      return (applicant.testResult.correctAnswer / totalQuestions) * 100;
    }
    
    if (applicant.correctAnswer !== undefined) {
      const totalQuestions = 15; // Fixed total as per API
      return (applicant.correctAnswer / totalQuestions) * 100;
    }
    
    const testData = applicant.testData;
    if (testData) {
      if (typeof testData.score === 'string' && testData.score.includes('/')) {
        const [correct, total] = testData.score.split('/').map(Number);
        if (total > 0) {
          return (correct / total) * 100;
        }
      }
      
      if (testData.percentage) {
        return parseFloat(testData.percentage);
      }
      
      if (testData.score && typeof testData.score === 'number') {
        return testData.score;
      }
      
      if (testData.correctAnswers !== undefined && testData.totalQuestions) {
        return (testData.correctAnswers / testData.totalQuestions) * 100;
      }
    }
    
    // Only use feedback ratings if no test data is available
    if (applicant.overallRating !== undefined && applicant.overallRating !== null) {
      return (applicant.overallRating / 5) * 100;
    }
    
    if (applicant.rating !== undefined && applicant.rating !== null) {
      return (applicant.rating / 5) * 100;
    }
    
    return 0;
  };

  // Calculate performance metrics
  const score = getNumericScore(applicant);
  const totalQuestions = 15; // Fixed total as per API
  const correctAnswers = (applicant.testResult && applicant.testResult.correctAnswer !== undefined) 
    ? applicant.testResult.correctAnswer 
    : (applicant.testData?.correctAnswers || applicant.correctAnswer || 0);
  const timeSpent = applicant.testData?.timeSpent || 0; // in seconds

  // Format time spent
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get questions data if available
  const questionsAttempted = applicant.testData?.questions || [];
  const answersProvided = applicant.testData?.answers || [];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                {applicant.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{applicant.fullName || applicant.name || 'Unknown Applicant'}</h1>
                <p className="text-blue-100 text-lg">{applicant.permanentEmail || applicant.email || 'N/A'}</p>
                <p className="text-blue-100">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-2">{score.toFixed(1)}%</div>
              <div className="text-blue-200">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Correct Answers</p>
                <p className="text-2xl font-bold text-gray-900">{correctAnswers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-xl mr-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Feedback Rating</p>
                <p className="text-2xl font-bold text-gray-900">{applicant.overallRating !== undefined && applicant.overallRating !== null ? applicant.overallRating : (applicant.rating !== undefined && applicant.rating !== null ? applicant.rating : 'N/A')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Applicant Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name</span>
                <span className="text-gray-900 font-medium">{applicant.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Father's Name</span>
                <span className="text-gray-900 font-medium">{applicant.fatherName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900 font-medium">{applicant.permanentEmail || applicant.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="text-gray-900 font-medium">{applicant.permanentPhone || applicant.phone || applicant.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth</span>
                <span className="text-gray-900 font-medium">{applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : (applicant.dob ? new Date(applicant.dob).toLocaleDateString() : 'N/A')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age</span>
                <span className="text-gray-900 font-medium">{applicant.age || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marital Status</span>
                <span className="text-gray-900 font-medium">{applicant.maritalStatus || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender</span>
                <span className="text-gray-900 font-medium">{applicant.sex || 'N/A'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Applied Position</span>
                <span className="text-gray-900 font-medium">{applicant.postAppliedFor || applicant.position || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LinkedIn Profile</span>
                <span className="text-gray-900 font-medium">
                  {applicant.linkedInProfile ? (
                    <a href={applicant.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  ) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Languages Known</span>
                <span className="text-gray-900 font-medium">{applicant.language || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Name</span>
                <span className="text-gray-900 font-medium">{applicant.referenceName || 'N/A'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Test Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (applicant.testResult && applicant.testResult.correctAnswer !== undefined) ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {(applicant.testResult && applicant.testResult.correctAnswer !== undefined) ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registration Date</span>
                <span className="text-gray-900 font-medium">
                  {new Date(applicant.createdAt || applicant.updatedAt || new Date(0)).toLocaleDateString()}
                </span>
              </div>
              {applicant.testData?.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Date</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(applicant.testData.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {applicant.testData?.timeSpent && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Duration</span>
                  <span className="text-gray-900 font-medium">
                    {formatTime(applicant.testData.timeSpent)}
                  </span>
                </div>
              )}
              {applicant.testData?.passFailStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Result</span>
                  <span className={`text-gray-900 font-medium ${applicant.testData.passFailStatus === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {applicant.testData.passFailStatus}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Address</span>
                <span className="text-gray-900 font-medium">{applicant.permanentAddressLine || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pin Code</span>
                <span className="text-gray-900 font-medium">{applicant.permanentPin || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Academic Records */}
        {applicant.academicRecords && applicant.academicRecords.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Records</h3>
            <div className="space-y-4">
              {applicant.academicRecords.map((record, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Board/University</span>
                      <p className="font-medium">{record.boardOrUniversity || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Examination</span>
                      <p className="font-medium">{record.examinationPassed || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Main Subjects</span>
                      <p className="font-medium">{record.mainSubjects || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Percentage</span>
                      <p className="font-medium">{record.percentage || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Institution</span>
                      <p className="font-medium">{record.schoolOrCollege || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Year of Passing</span>
                      <p className="font-medium">{record.yearOfPassing || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Work Experience */}
        {applicant.workExperiences && applicant.workExperiences.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Work Experience</h3>
            <div className="space-y-4">
              {applicant.workExperiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Employer</span>
                      <p className="font-medium">{exp.employerName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Designation</span>
                      <p className="font-medium">{exp.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Duration</span>
                      <p className="font-medium">{exp.durationFrom || 'N/A'} to {exp.durationTo || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Joining Date</span>
                      <p className="font-medium">{exp.joiningDate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Last Date</span>
                      <p className="font-medium">{exp.lastDate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Salary</span>
                      <p className="font-medium">{exp.totalSalary || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <span className="text-gray-600 text-sm">Job Profile</span>
                      <p className="font-medium">{exp.briefJobProfile || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reference Information */}
        {(applicant.reference1Name || applicant.reference2Name) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">References</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applicant.reference1Name && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h4 className="font-bold text-gray-800 mb-3">Reference 1</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Name</span>
                      <span className="font-medium">{applicant.reference1Name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Mobile</span>
                      <span className="font-medium">{applicant.reference1Mobile}</span>
                    </div>
                  </div>
                </div>
              )}
              {applicant.reference2Name && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h4 className="font-bold text-gray-800 mb-3">Reference 2</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Name</span>
                      <span className="font-medium">{applicant.reference2Name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Mobile</span>
                      <span className="font-medium">{applicant.reference2Mobile}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Performance Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Breakdown</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Score Distribution</span>
                  <span className="text-gray-900 font-bold">{score.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      score >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                      'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-800">{correctAnswers}</div>
                  <div className="text-green-700">Correct</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-800">{totalQuestions - correctAnswers}</div>
                  <div className="text-red-700">Incorrect</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h4 className="font-bold text-gray-900 mb-4">Test Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applied Position</span>
                  <span className="text-gray-900 font-medium">{applicant.postAppliedFor || applicant.position || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions</span>
                  <span className="text-gray-900 font-medium">{totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct Answers</span>
                  <span className="text-gray-900 font-medium">{correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Score</span>
                  <span className="text-gray-900 font-medium">{score.toFixed(1)}%</span>
                </div>
                {(applicant.overallRating || applicant.rating) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Feedback Rating</span>
                    <div className="flex items-center">
                      <StarRating rating={applicant.overallRating || applicant.rating} maxRating={5} />
                      <span className="ml-2 text-gray-900 font-medium">({applicant.overallRating || applicant.rating}/5)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Attempted */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Test Questions & Answers</h3>
          {questionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (questionsAttempted.length > 0 || (applicant.questionsData && typeof applicant.questionsData === 'object' && !Array.isArray(applicant.questionsData) && applicant.questionsData.questions && applicant.questionsData.questions.length > 0) || (Array.isArray(applicant.questionsData) && applicant.questionsData.length > 0 && applicant.questionsData.some(attempt => attempt.questions && attempt.questions.length > 0))) ? (
            <div className="space-y-4">
              {(applicant.questionsData && typeof applicant.questionsData === 'object' && !Array.isArray(applicant.questionsData) && applicant.questionsData.questions && applicant.questionsData.questions.length > 0) ? 
                // Display questions from single API response object
                applicant.questionsData.questions.map((question, index) => {
                  const userAnswer = question.userAnswer;
                  const correctAnswer = question.aiAnswer;
                  const isCorrect = userAnswer === correctAnswer;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl border ${
                        isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                              isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? 'CORRECT' : 'INCORRECT'}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-3">{question.aiQuestion}</h4>
                          
                          <div className="space-y-2 mb-3">
                            {question.Options?.map((option, optIndex) => {
                              const isSelected = userAnswer === option;
                              const isAnswer = correctAnswer === option;
                              
                              return (
                                <div 
                                  key={optIndex}
                                  className={`p-3 rounded-lg border flex items-start ${
                                    isSelected 
                                      ? isCorrect 
                                        ? 'border-green-500 bg-green-100' 
                                        : 'border-red-500 bg-red-100'
                                      : isAnswer
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 ${
                                    isSelected 
                                      ? isCorrect 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-red-500 text-white'
                                      : isAnswer
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <div className="flex-1">
                                    <span className={`${
                                      isSelected 
                                        ? isCorrect 
                                          ? 'text-green-800 font-medium' 
                                          : 'text-red-800 font-medium'
                                        : isAnswer
                                          ? 'text-green-800 font-medium'
                                          : 'text-gray-700'
                                    }`}>
                                      {option}
                                    </span>
                                    {isSelected && (
                                      <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                                        Your Answer
                                      </span>
                                    )}
                                    {isAnswer && !isSelected && (
                                      <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                                        Correct Answer
                                      </span>
                                    )}
                                    {isAnswer && isSelected && (
                                      <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-200 text-green-900">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Correct Answer:</span> {question.aiAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                : (Array.isArray(applicant.questionsData) && applicant.questionsData.length > 0) ?
                // Handle the case where questionsData is an array of test attempts
                applicant.questionsData.map((attempt, attemptIndex) => (
                  <div key={attemptIndex} className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Test Attempt #{attemptIndex + 1}</h4>
                    {attempt.questions && attempt.questions.map((question, index) => {
                      const userAnswer = question.userAnswer;
                      const correctAnswer = question.aiAnswer;
                      const isCorrect = userAnswer === correctAnswer;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-xl border ${
                            isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                                  isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                  {index + 1}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isCorrect ? 'CORRECT' : 'INCORRECT'}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-3">{question.aiQuestion}</h4>
                              
                              <div className="space-y-2 mb-3">
                                {question.Options?.map((option, optIndex) => {
                                  const isSelected = userAnswer === option;
                                  const isAnswer = correctAnswer === option;
                                  
                                  return (
                                    <div 
                                      key={optIndex}
                                      className={`p-3 rounded-lg border flex items-start ${
                                        isSelected 
                                          ? isCorrect 
                                            ? 'border-green-500 bg-green-100' 
                                            : 'border-red-500 bg-red-100'
                                          : isAnswer
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                      }`}
                                    >
                                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 ${
                                        isSelected 
                                          ? isCorrect 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-red-500 text-white'
                                          : isAnswer
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                      <div className="flex-1">
                                        <span className={`${
                                          isSelected 
                                            ? isCorrect 
                                              ? 'text-green-800 font-medium' 
                                              : 'text-red-800 font-medium'
                                            : isAnswer
                                              ? 'text-green-800 font-medium'
                                              : 'text-gray-700'
                                        }`}>
                                          {option}
                                        </span>
                                        {isSelected && (
                                          <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                                            Your Answer
                                          </span>
                                        )}
                                        {isAnswer && !isSelected && (
                                          <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                                            Correct Answer
                                          </span>
                                        )}
                                        {isAnswer && isSelected && (
                                          <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-200 text-green-900">
                                            Correct Answer
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Correct Answer:</span> {question.aiAnswer}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
                : 
                // Display questions from local data
                questionsAttempted.map((question, index) => {
                  const userAnswer = answersProvided[question.id] || answersProvided[index];
                  const isCorrect = question.correctAnswer === userAnswer;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl border ${
                        isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                              isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? 'CORRECT' : 'INCORRECT'}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-3">{question.question}</h4>
                          
                          <div className="space-y-2 mb-3">
                            {question.options?.map((option, optIndex) => {
                              const isSelected = userAnswer === optIndex;
                              const isAnswer = question.correctAnswer === optIndex;
                              
                              return (
                                <div 
                                  key={optIndex}
                                  className={`p-3 rounded-lg border flex items-start ${
                                    isSelected 
                                      ? isCorrect 
                                        ? 'border-green-500 bg-green-100' 
                                        : 'border-red-500 bg-red-100'
                                      : isAnswer
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 ${
                                    isSelected 
                                      ? isCorrect 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-red-500 text-white'
                                      : isAnswer
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <div className="flex-1">
                                    <span className={`${
                                      isSelected 
                                        ? isCorrect 
                                          ? 'text-green-800 font-medium' 
                                          : 'text-red-800 font-medium'
                                        : isAnswer
                                          ? 'text-green-800 font-medium'
                                          : 'text-gray-700'
                                    }`}>
                                      {option}
                                    </span>
                                    {isSelected && (
                                      <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                                        Your Answer
                                      </span>
                                    )}
                                    {isAnswer && !isSelected && (
                                      <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                                        Correct Answer
                                      </span>
                                    )}
                                    {isAnswer && isSelected && (
                                      <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-green-200 text-green-900">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {question.category || 'N/A'} | 
                            <span className="font-medium ml-1">Difficulty:</span> {question.difficulty || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No test questions and answers available for this applicant.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/admin/modern/applicants')}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Back to Applicants
          </button>
        </div>
      </div>
  );
};

export default ApplicantDetails;