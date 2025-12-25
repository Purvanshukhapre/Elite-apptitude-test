const ReviewStep = ({ formData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Information</h2>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-semibold text-gray-900">{formData.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{formData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold text-gray-900">{formData.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Education</p>
            <p className="font-semibold text-gray-900 capitalize">{formData.education?.replace('-', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="font-semibold text-gray-900">{formData.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Experience</p>
            <p className="font-semibold text-gray-900 capitalize">{formData.experience} years</p>
          </div>
        </div>
        
        {formData.expectedSalary && (
          <div>
            <p className="text-sm text-gray-600">Expected Salary</p>
            <p className="font-semibold text-gray-900">{formData.expectedSalary}</p>
          </div>
        )}
        
        {formData.resumeLink && (
          <div>
            <p className="text-sm text-gray-600">Resume Link</p>
            <a href={formData.resumeLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
              View Resume
            </a>
          </div>
        )}
        
        {formData.coverLetter && (
          <div>
            <p className="text-sm text-gray-600">Cover Letter</p>
            <p className="text-gray-900">{formData.coverLetter}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Next Step:</strong> After confirming your details, you'll proceed to the aptitude test. 
          The test consists of 10 questions and you'll have 30 minutes to complete it.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;