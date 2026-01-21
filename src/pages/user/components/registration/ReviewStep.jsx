const ReviewStep = ({ formData }) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Review Your Information</h2>
        <p className="text-gray-600">Please review all the information before submitting</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-semibold text-gray-900">{formData.fullName || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Father's Name</p>
            <p className="font-semibold text-gray-900">{formData.fatherName || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{formData.permanentEmail || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold text-gray-900">{formData.permanentPhone || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Age</p>
            <p className="font-semibold text-gray-900">{formData.age || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Marital Status</p>
            <p className="font-semibold text-gray-900 capitalize">{formData.maritalStatus || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-semibold text-gray-900 capitalize">{formData.sex || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-semibold text-gray-900">{formData.permanentAddressLine || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Pincode</p>
            <p className="font-semibold text-gray-900">{formData.permanentPin || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Languages Known</p>
            <p className="font-semibold text-gray-900">{formData.language || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2h4a2 2 0 002-2V8" />
          </svg>
          Position Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Position Applied For</p>
            <p className="font-semibold text-gray-900">{formData.postAppliedFor || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Experience</p>
            <p className="font-semibold text-gray-900 capitalize">{formData.experience || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Experience Level</p>
            <p className="font-semibold text-gray-900 capitalize">{formData.experienceLevel || 'N/A'}</p>
          </div>
          {formData.linkedInProfile && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">LinkedIn Profile</p>
              <a href={formData.linkedInProfile} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                View Profile
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Academic Records
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">School/College</p>
            <p className="font-semibold text-gray-900">{formData.academicRecords[0]?.schoolOrCollege || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Board/University</p>
            <p className="font-semibold text-gray-900">{formData.academicRecords[0]?.boardOrUniversity || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Examination Passed</p>
            <p className="font-semibold text-gray-900">{formData.academicRecords[0]?.examinationPassed || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Year of Passing</p>
            <p className="font-semibold text-gray-900">{formData.academicRecords[0]?.yearOfPassing || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Main Subjects</p>
            <p className="font-semibold text-gray-900">{formData.academicRecords[0]?.mainSubjects || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Percentage/CGPA</p>
            <p className="font-semibold text-gray-900">{formData.academicRecords[0]?.percentage || 'N/A'}</p>
          </div>
        </div>
      </div>

      {formData.experience !== 'fresher' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2h4a2 2 0 002-2V8" />
            </svg>
            Work Experience
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Employer Name</p>
              <p className="font-semibold text-gray-900">{formData.workExperiences[0]?.employerName || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Designation</p>
              <p className="font-semibold text-gray-900">{formData.workExperiences[0]?.designation || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Duration From</p>
              <p className="font-semibold text-gray-900">{formData.workExperiences[0]?.durationFrom || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Duration To</p>
              <p className="font-semibold text-gray-900">{formData.workExperiences[0]?.durationTo || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Job Profile</p>
              <p className="font-semibold text-gray-900">{formData.workExperiences[0]?.briefJobProfile || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills
        </h3>
        
        <div className="mt-4">
          {formData.primarySkills && formData.primarySkills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Primary Skills</p>
              <div className="flex flex-wrap gap-2">
                {formData.primarySkills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {formData.secondarySkills && formData.secondarySkills.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Secondary Skills</p>
              <div className="flex flex-wrap gap-2">
                {formData.secondarySkills.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {(formData.primarySkills?.length === 0 && formData.secondarySkills?.length === 0) && (
            <p className="text-gray-500 italic">No skills added</p>
          )}
        </div>
      </div>

      {/* Resume Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resume
        </h3>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Resume Status</p>
          <p className="font-semibold text-gray-900">{formData.resume ? `Uploaded: ${formData.resume.name || 'Resume.pdf'}` : 'Not uploaded'}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Next Step</h4>
            <p className="text-blue-800">
              After confirming your details, you'll proceed to the aptitude test. 
              The test consists of 15 questions and you'll have 15 minutes to complete it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;