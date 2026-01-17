import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getTestQuestionsByEmail, getAllTestResults, getAllFeedback, getApplicantsById } from '../../api';
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
      try {
        const decodedId = decodeURIComponent(id);
        
        // First, try to find in local applicants
        let localApplicant = applicants.find(app => 
          app._id === decodedId || app.id === decodedId
        ) || 
        applicants.find(app => 
          app.fullName === decodedId || app.name === decodedId ||
          app.fullName?.toLowerCase() === decodedId.toLowerCase() || 
          app.name?.toLowerCase() === decodedId.toLowerCase()
        ) ||
        (isNaN(parseInt(decodedId)) ? null : applicants[parseInt(decodedId)]);
        
        // Then, try to fetch from API to get fresh data
        let applicantData = null;
        try {
          const data = await getApplicantsById(decodedId);
          // Check if the API returned an empty array (which happens on 403)
          if (Array.isArray(data) && data.length === 0) {
            // If API returns empty array (likely due to 403), use local data
            if (localApplicant) {
              applicantData = localApplicant;
            }
          } else {
            applicantData = Array.isArray(data) ? data[0] : data;
          }
        } catch (apiError) {
          console.error('Error fetching applicant data from API:', apiError);
          // If API fails but we found locally, use the local data
          if (localApplicant) {
            applicantData = localApplicant;
          }
        }
        
        if (applicantData) {
          // Fetch additional data (feedback, test results) to enrich the applicant data
          
          // Fetch feedback data
          let feedbackData = [];
          try {
            feedbackData = await getAllFeedback();
          } catch (error) {
            console.error('Error fetching feedback:', error);
            feedbackData = [];
          }
          
          // Fetch test results
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
            
            const updatedApplicant = {
              ...applicantData,
              testResult: applicantTestResult || null,
              correctAnswer: applicantTestResult?.correctAnswer || applicantData.correctAnswer,
              overallRating: applicantFeedback ? applicantFeedback.rating : undefined
            };
            
            setApplicant(updatedApplicant);
            
            // Process resume data
            if (updatedApplicant.resumeUrl) {
              // Extract the actual filename from the resumeUrl
              const urlParts = updatedApplicant.resumeUrl.split('/');
              let extractedFilename = urlParts[urlParts.length - 1];
              
              // Clean the filename by removing UUID prefixes like "696b48c9177b178b2f0d4c89-bf198e3d-15f7-4fcf-98a6-313adff355b5-"
              // Keep only the part after the last occurrence of "-" before the file extension
              if (extractedFilename.includes('-') && extractedFilename.includes('.')) {
                const lastDotIndex = extractedFilename.lastIndexOf('.');
                const filenameWithoutExt = extractedFilename.substring(0, lastDotIndex);
                const extension = extractedFilename.substring(lastDotIndex);
                
                // Get the part after the last hyphen (which should be the actual filename)
                const filenameParts = filenameWithoutExt.split('-');
                const actualFilename = filenameParts[filenameParts.length - 1];
                
                extractedFilename = actualFilename + extension;
              }
              
              // Check if resumeId contains the actual filename (not just an ID)
              const resumeId = updatedApplicant.resumeId;
              const isActualFilename = resumeId && (resumeId.includes('.') || resumeId.includes('_') || resumeId.length < 20);
              
              setResumeData({
                resumeUrl: updatedApplicant.resumeUrl,
                s3Key: resumeId || 'resume',
                fileName: updatedApplicant.resumeFileName || updatedApplicant.originalFileName || updatedApplicant.fileName || updatedApplicant.resumeOriginalName || updatedApplicant.originalResumeName || extractedFilename || (isActualFilename ? resumeId : null),
                uploadedAt: new Date().toISOString()
              });
            }
            
            // Fetch questions data if available
            const email = updatedApplicant.permanentEmail || updatedApplicant.email;
            if (email) {
              setQuestionsLoading(true);
              try {
                const questionsData = await getTestQuestionsByEmail(email);
                setApplicant(prev => ({
                  ...prev,
                  questionsData
                }));
              } catch (questionsError) {
                console.error('Could not fetch questions data:', questionsError);
              } finally {
                setQuestionsLoading(false);
              }
            } else {
              setQuestionsLoading(false);
            }
          } catch (testResultsError) {
            console.error('Could not fetch test results:', testResultsError);
          }
        } else {
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