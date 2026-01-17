import { useMemo } from 'react';

const formatDate = (dateValue) => {
  if (dateValue) {
    return new Date(dateValue).toLocaleDateString();
  }
  return 'Date not available';
};

const ApplicantDetailsSection = ({ applicant }) => {
  const testStatus = useMemo(() => {
    return (applicant.testResult && applicant.testResult.correctAnswer !== undefined) || 
           (applicant.testData && applicant.testData.score) || 
           (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) 
           ? 'Completed' 
           : 'Pending';
  }, [applicant]);

  const testStatusColor = testStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

  return (
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${testStatusColor}`}>
              {testStatus}
            </span>
          </div>
          {applicant.testData?.submittedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Test Date</span>
              <span className="text-gray-900 font-medium">
                {formatDate(applicant.testData.submittedAt)}
              </span>
            </div>
          )}
          {applicant.testData?.timeSpent && (
            <div className="flex justify-between">
              <span className="text-gray-600">Test Duration</span>
              <span className="text-gray-900 font-medium">
                {`${Math.floor(applicant.testData.timeSpent / 60)}m ${applicant.testData.timeSpent % 60}s`}
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
  );
};

export default ApplicantDetailsSection;