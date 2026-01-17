const ResumeSection = ({ resumeData }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Resume</h3>
      {resumeData ? (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">{resumeData.fileName || resumeData.originalName || resumeData.s3Key.split('/').pop()}</p>
              <p className="text-sm text-gray-500">Uploaded: {resumeData.uploadedAt ? new Date(resumeData.uploadedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <a 
            href={resumeData.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Resume
          </a>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No resume available for this applicant.
        </div>
      )}
    </div>
  );
};

export default ResumeSection;