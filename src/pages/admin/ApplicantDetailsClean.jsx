import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getApplicantsById } from '../../api';
import ApplicantHeader from '../../components/admin/ApplicantHeader';
import ApplicantStats from '../../components/admin/ApplicantStats';
import ApplicantDetailsSection from '../../components/admin/ApplicantDetailsSection';
import SkillsSection from '../../components/admin/SkillsSection';
import AcademicRecordsSection from '../../components/admin/AcademicRecordsSection';
import WorkExperienceSection from '../../components/admin/WorkExperienceSection';
import ReferencesSection from '../../components/admin/ReferencesSection';
import ResumeSection from '../../components/admin/ResumeSection';
import PerformanceSection from '../../components/admin/PerformanceSection';
import TestQuestionsSection from '../../components/admin/TestQuestionsSection';
import ActionButtons from '../../components/admin/ActionButtons';

const ApplicantDetailsClean = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applicants } = useApp();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const fetchApplicantData = async () => {
      setLoading(true);
      setQuestionsLoading(true);
      
      try {
        console.log('Applicant ID from route params:', id);
        const decodedId = decodeURIComponent(id);
        
        // 🔹 Find local fallback - try to find by various identifiers
        const localApplicant =
          applicants.find(a => a._id === decodedId || a.id === decodedId) ||
          applicants.find(
            a =>
              a.fullName?.toLowerCase() === decodedId.toLowerCase() ||
              a.name?.toLowerCase() === decodedId.toLowerCase() ||
              a.email?.toLowerCase() === decodedId.toLowerCase() ||
              a.permanentEmail?.toLowerCase() === decodedId.toLowerCase()
          ) ||
          (!isNaN(decodedId) ? applicants[Number(decodedId)] : null);
        
        // Extract the studentFormId for API call
        // Try to extract ID from resume URL if available, otherwise use route parameter
        // The resume URL contains the correct ID in format: /resume/{studentFormId}-...
        let apiStudentFormId = decodedId; // Default to route parameter
        
        // Look for a local applicant to check if we have a resume URL
        if (localApplicant && localApplicant.resumeUrl) {
          // Extract ID from resume URL
          const resumeUrlPattern = /\/resume\/([a-f0-9]+)/;
          const match = localApplicant.resumeUrl.match(resumeUrlPattern);
          if (match && match[1]) {
            const extractedId = match[1];
            console.log('Found studentFormId in resume URL:', extractedId);
            apiStudentFormId = extractedId;
          }
        }
        
        console.log('Final API studentFormId determined:', apiStudentFormId);
        
        console.log('Local applicant found:', localApplicant);
        console.log('Local applicant questions:', localApplicant?.questions);

        let apiResponse = null;

        // Check if admin is authenticated before making API call
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminToken) {
          try {
            console.log('Using studentFormId for API call:', apiStudentFormId);
            const response = await getApplicantsById(apiStudentFormId);
            apiResponse = response;
            console.log('Full API response:', response);

            
            // Try to get questions separately if not in main response
            if ((!apiResponse || !apiResponse.questions || apiResponse.questions.length === 0) && localApplicant?.studentFormId) {
              console.log('Trying to fetch questions using studentFormId:', localApplicant.studentFormId);
              // We could try other endpoints here if needed
            }
          } catch (err) {
            console.error('API error:', err);
            // If API fails but we have local data, continue with local data
          }
        } else {
          console.warn('Admin not authenticated, using local applicant data only');
          console.log('Available local applicant data:', localApplicant);
        }

        let applicantData = null;
        let questionsData = null;
        let resultData = null;
        let feedbackData = null;
        let resumeFromApi = null;

        // Check if the API returned an empty array (which happens on 403)
        if (Array.isArray(apiResponse) && apiResponse.length === 0) {
          // If API returns empty array (likely due to 403), use local data
          if (localApplicant) {
            applicantData = localApplicant;
          }
        } else if (apiResponse && typeof apiResponse === 'object') {
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
          
          // Extract questions correctly according to backend structure
          const questionsList = apiResponse?.questions?.questions || [];
          console.log('Extracted questions list:', questionsList);
        }

        // If no applicantData from API but we have local data, use local data
        if (!applicantData && localApplicant) {
          applicantData = localApplicant;
        }

        // If still no applicant data, set to null and return
        if (!applicantData) {
          setApplicant(null);
          return;
        }

        const updatedApplicant = {
          ...applicantData,
          testResult: resultData,
          correctAnswer:
            resultData?.correctAnswer ||
            resultData?.correctAnswers ||
            applicantData.correctAnswer,
          feedback: feedbackData,
          overallRating: feedbackData?.rating,
          questions: questionsData?.questions || [],
          resume: resumeFromApi,
          resumeUrl: resumeFromApi?.resumeUrl || applicantData.resumeUrl
        };


        
        setApplicant(updatedApplicant);

        
        // 🔹 Questions handling
        const questionsList = apiResponse?.questions?.questions || [];
        console.log('Questions data received:', questionsData);
        console.log('Questions list for rendering:', questionsList);
        
        if (questionsList.length > 0) {
          console.log('Processing questions:', questionsList);
          setApplicant(prev => ({
            ...prev,
            questionsData: {
              questions: questionsList
            }
          }));
        } else {
          console.log('No questions found in API response or questions array is empty');
        }

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



      } catch (error) {
        console.error('Unexpected error:', error);
        setApplicant(null);
      } finally {
        setLoading(false);
        setQuestionsLoading(false);
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