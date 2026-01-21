import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicantById, getTestResultById } from '../../api';
import ApplicantHeader from './components/ApplicantHeader';
import ApplicantStats from './components/ApplicantStats';
import ApplicantDetailsSection from './components/ApplicantDetailsSection';
import SkillsSection from './components/SkillsSection';
import AcademicRecordsSection from './components/AcademicRecordsSection';
import WorkExperienceSection from './components/WorkExperienceSection';
import ReferencesSection from './components/ReferencesSection';
import ResumeSection from './components/ResumeSection';
import PerformanceSection from './components/PerformanceSection';
import TestQuestionsSection from './components/TestQuestionsSection';
import ActionButtons from './components/ActionButtons';

const ApplicantDetailsClean = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicantData = async () => {
      setLoading(true);
      setQuestionsLoading(true);
      setError(null); // Reset error state
      
      try {
        // ✅ SINGLE SOURCE OF TRUTH: Use ONLY the ID from route params
        if (!id) {
          throw new Error("Applicant ID missing – cannot proceed");
        }
        
        console.log('Using route param ID as single source of truth:', id);
        const decodedId = decodeURIComponent(id);
        
        // ✅ FETCH PARTICULAR STUDENT DETAILS using ONLY the route param ID
        console.log('Fetching individual applicant with route param ID:', decodedId);
        const apiResponse = await getApplicantById(decodedId);
        console.log('Individual applicant API Response:', apiResponse);
        
        if (apiResponse) {
          // Process the API response to extract applicant data
          let applicantData = null;
          let questionsData = null;
          let resultData = null;
          let feedbackData = null;
          let resumeFromApi = null;
          
          // Handle the API response structure from /auth/student/{id}
          // The response has the format: { studentForm, feedback, result, resume, questions }
          if (apiResponse.studentForm) {
            // Use the studentForm data as the main applicant data
            applicantData = apiResponse.studentForm;
            questionsData = apiResponse.questions || null;
            resultData = apiResponse.result || null;
            feedbackData = apiResponse.feedback || null;
            resumeFromApi = apiResponse.resume || null;
          } else {
            // Fallback if response doesn't have studentForm wrapper
            applicantData = apiResponse;
            questionsData = apiResponse.questions || null;
            resultData = apiResponse.result || null;
            feedbackData = apiResponse.feedback || null;
            resumeFromApi = apiResponse.resume || null;
          }
          
          // Check if we have correct answer data, if not try to fetch from the result API
          let finalResultData = resultData;
          
          if (!finalResultData || (!finalResultData.correctAnswer && !finalResultData.correctAnswers)) {
            try {
              // Attempt to fetch test result data from the specific result endpoint
              const resultId = applicantData.studentFormId || applicantData.id;
              if (resultId) {
                const testResultData = await getTestResultById(resultId);
                if (testResultData && (testResultData.correctAnswer !== undefined || testResultData.correctAnswers !== undefined)) {
                  finalResultData = testResultData;
                  console.log('Successfully fetched test result from result endpoint:', testResultData);
                }
              }
            } catch (resultError) {
              console.warn('Could not fetch test result from result endpoint:', resultError.message);
              // Continue with existing data if result endpoint fails
            }
          }
          
          // Handle the new API structure where questions are in response.questions.questions
          let finalQuestions = [];
                  
          console.log('Processing questions data:', questionsData);
                  
          // First, try the new API structure: response.questions.questions
          if (questionsData && typeof questionsData === 'object' && questionsData.questions) {
            finalQuestions = questionsData.questions;
            console.log('Found questions in response.questions.questions:', finalQuestions.length);
          }
                  
          // Fallback to direct questions array
          if ((!finalQuestions || finalQuestions.length === 0) && Array.isArray(questionsData)) {
            finalQuestions = questionsData;
            console.log('Using direct questions array:', finalQuestions.length);
          }
                  
          // Last resort: try other possible locations
          if (!finalQuestions || finalQuestions.length === 0) {
            const backupQuestions = applicantData?.questions || applicantData?.testData?.questions || [];
            if (backupQuestions.length > 0) {
              finalQuestions = backupQuestions;
              console.log('Using backup questions:', finalQuestions.length);
            }
          }
                  
          console.log('Final questions count:', finalQuestions.length);
          
          const updatedApplicant = {
            ...applicantData,
            testResult: finalResultData,
            correctAnswer:
              finalResultData?.correctAnswer ||
              finalResultData?.correctAnswers ||
              applicantData.correctAnswer,
            feedback: feedbackData,
            overallRating: feedbackData?.rating,
            questions: finalQuestions,
            questionsData: {
              questions: finalQuestions
            },
            resume: resumeFromApi,
            resumeUrl: resumeFromApi?.resumeUrl || applicantData.resumeUrl
          };

          setApplicant(updatedApplicant);

          // 🔹 Resume handling
          if (updatedApplicant.resumeUrl) {
            const urlParts = updatedApplicant.resumeUrl.split('/');
            let fileName = urlParts[urlParts.length - 1];

            if (fileName.includes('-') && fileName.includes('.')) {
              const ext = fileName.substring(fileName.lastIndexOf('.'));
              const name = fileName
                .substring(0, fileName.lastIndexOf('.'))
                .split('-')
                .pop();
              fileName = name + ext;
            }

            setResumeData({
              resumeUrl: updatedApplicant.resumeUrl,
              s3Key: updatedApplicant.resumeId || 'resume',
              fileName:
                updatedApplicant.resumeFileName ||
                updatedApplicant.originalFileName ||
                fileName,
              uploadedAt: new Date().toISOString()
            });
          }
        } else {
          // ❌ No data found - show error state
          console.log('Applicant not found in API');
          setApplicant(null);
        }
      } catch (error) {
        console.error('Error fetching individual applicant:', error);
        setError(error.message);
        // ❌ API failed - show error state, NO FALLBACKS
        setApplicant(null);
      } finally {
        setLoading(false);
        setQuestionsLoading(false);
      }
    };

    fetchApplicantData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !applicant) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">We're sorry, but an error occurred while loading this page.</p>
        <p className="text-red-500 mb-4 text-sm">{error}</p>
        <button 
          onClick={() => navigate('/admin/modern/applicants')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Back to Applicants
        </button>
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

  return (
    <div className="space-y-6">
      <ApplicantHeader applicant={applicant} />
      <ApplicantStats applicant={applicant} />
      <ApplicantDetailsSection applicant={applicant} />
      <SkillsSection applicant={applicant} />
      <AcademicRecordsSection applicant={applicant} />
      <WorkExperienceSection applicant={applicant} />
      <ReferencesSection applicant={applicant} />
      <ResumeSection resumeData={resumeData} />
      <PerformanceSection applicant={applicant} />
      <TestQuestionsSection applicant={applicant} loading={questionsLoading} />
      <ActionButtons applicant={applicant} navigate={navigate} />
    </div>
  );
};

export default ApplicantDetailsClean;