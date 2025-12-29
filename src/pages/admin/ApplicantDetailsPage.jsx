import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import AdminLayout from '../../components/AdminLayout';

const ApplicantDetailsPage = () => {
  const { applicantId } = useParams();
  // Decode the applicant name from the URL parameter
  const applicantName = decodeURIComponent(applicantId);
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useApp();
  const [applicant, setApplicant] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { applicants } = useApp();
  
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
      return;
    }

    const fetchApplicantDetails = async () => {
      try {
        setLoading(true);
        
        // Wait a brief moment to allow context to be fully populated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Find the applicant in the context first using the name
        const foundApplicant = applicants.find(app => app.fullName === applicantName);
        if (foundApplicant) {
          setApplicant(foundApplicant);
          
          // Set test result if available in the applicant data
          if (foundApplicant.testData) {
            setTestResult(foundApplicant.testData);
          }
          
          // Set feedback if available in the applicant data
          if (foundApplicant.feedback) {
            setFeedback(foundApplicant.feedback);
          }
        } else {
          // If not found in context, show not found message
          console.log('Applicant not found in context:', applicantName);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantDetails();
  }, [applicantId, applicantName, isAdminAuthenticated, navigate, applicants]);

  if (!isAdminAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout activeTab="applicants">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applicant details...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout activeTab="applicants">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Applicant</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => navigate('/admin/modern/applicants')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Applicants
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!applicant) {
    return (
      <AdminLayout activeTab="applicants">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Applicant Not Found</h3>
            <p className="text-yellow-600">The requested applicant could not be found.</p>
            <button 
              onClick={() => navigate('/admin/modern/applicants')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Applicants
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="applicants">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/modern/applicants')}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Applicants
          </button>
        </div>

        {/* Applicant Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(applicant.fullName || 'U').charAt(0)}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{applicant.fullName}</h1>
                  <p className="text-lg text-gray-600">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {applicant.permanentEmail || applicant.email || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {applicant.permanentPhone || applicant.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Applied on</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(applicant.submittedAt || applicant.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Father's Name</label>
                  <p className="text-gray-900">{applicant.fatherName || applicant.personalInfo?.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{applicant.dateOfBirth || applicant.personalInfo?.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-gray-900">{applicant.age || applicant.personalInfo?.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-gray-900">{applicant.maritalStatus || applicant.personalInfo?.maritalStatus || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900">{applicant.sex || applicant.personalInfo?.sex || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Language</label>
                  <p className="text-gray-900">{applicant.language || applicant.personalInfo?.language || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">LinkedIn Profile</label>
                  <p className="text-blue-600">
                    {applicant.linkedInProfile || applicant.personalInfo?.linkedInProfile ? (
                      <a href={applicant.linkedInProfile || applicant.personalInfo?.linkedInProfile} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {applicant.linkedInProfile || applicant.personalInfo?.linkedInProfile}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Address Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Permanent Address</label>
                  <p className="text-gray-900">{applicant.permanentAddressLine || applicant.address?.permanentAddressLine || applicant.permanentAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pin Code</label>
                  <p className="text-gray-900">{applicant.permanentPin || applicant.address?.permanentPin || applicant.personalInfo?.permanentPin || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Academic & Work Experience */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Results */}
            {testResult && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Test Results</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Score</label>
                      <p className="text-2xl font-bold text-gray-900">
                        {testResult.score || testResult.percentage || 'N/A'}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className={`text-lg font-semibold ${
                        testResult.passFailStatus === 'Pass' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResult.passFailStatus || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {testResult.correctAnswers !== undefined && testResult.totalQuestions && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        <span className="font-semibold">Performance:</span> {testResult.correctAnswers} out of {testResult.totalQuestions} questions correct
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Feedback</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex mr-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= (feedback.overallRating || feedback.rating) ? 'text-amber-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {(feedback.overallRating || feedback.rating)}/5
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Test Difficulty</label>
                      <p className="text-gray-900">{feedback.testDifficulty || feedback.problem1 || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Platform Experience</label>
                      <p className="text-gray-900">{feedback.platformExperience || feedback.problem2 || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Improvements</label>
                      <p className="text-gray-900">{feedback.improvements || feedback.problem3 || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Would Recommend</label>
                      <p className="text-gray-900">{feedback.wouldRecommend || feedback.problem4 || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Comments</label>
                      <p className="text-gray-900">{feedback.comments || feedback.problem5 || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Records */}
            {(applicant.academicRecords && applicant.academicRecords.length > 0) || (applicant.education && applicant.education !== 'N/A') ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Academic Records</h2>
                </div>
                <div className="p-6">
                  {applicant.academicRecords && applicant.academicRecords.length > 0 ? (
                    applicant.academicRecords.map((record, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                        <h3 className="font-semibold text-gray-900">{record.examinationPassed}</h3>
                        <p className="text-gray-600">{record.schoolOrCollege}</p>
                        <p className="text-sm text-gray-500">{record.boardOrUniversity}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="text-xs text-gray-500">Year of Passing</label>
                            <p className="text-sm">{record.yearOfPassing || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Percentage</label>
                            <p className="text-sm">{record.percentage || 'N/A'}</p>
                          </div>
                        </div>
                        {record.mainSubjects && (
                          <div className="mt-2">
                            <label className="text-xs text-gray-500">Main Subjects</label>
                            <p className="text-sm">{record.mainSubjects}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                      <h3 className="font-semibold text-gray-900">Education</h3>
                      <p className="text-gray-600">{applicant.education || 'N/A'}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="text-xs text-gray-500">Experience Level</label>
                          <p className="text-sm">{applicant.experience || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Status</label>
                          <p className="text-sm">{applicant.status || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Work Experience */}
            {(applicant.workExperiences && applicant.workExperiences.length > 0) || (applicant.experience && applicant.experience !== 'N/A') ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
                </div>
                <div className="p-6">
                  {applicant.workExperiences && applicant.workExperiences.length > 0 ? (
                    applicant.workExperiences.map((experience, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                        <h3 className="font-semibold text-gray-900">{experience.designation}</h3>
                        <p className="text-gray-600">{experience.employerName}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="text-xs text-gray-500">Duration</label>
                            <p className="text-sm">
                              {experience.durationFrom || experience.joiningDate} to {experience.durationTo || experience.lastDate}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Salary</label>
                            <p className="text-sm">{experience.totalSalary || 'N/A'}</p>
                          </div>
                        </div>
                        {experience.briefJobProfile && (
                          <div className="mt-2">
                            <label className="text-xs text-gray-500">Job Profile</label>
                            <p className="text-sm">{experience.briefJobProfile}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                      <h3 className="font-semibold text-gray-900">Experience Level</h3>
                      <p className="text-gray-600">{applicant.experience || 'N/A'}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="text-xs text-gray-500">Status</label>
                          <p className="text-sm">{applicant.status || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Rating</label>
                          <p className="text-sm">{applicant.rating !== undefined ? `${applicant.rating}/5` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ApplicantDetailsPage;