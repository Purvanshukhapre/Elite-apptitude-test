import { useState } from 'react';
import ResumeUpload from './ResumeUpload';

const PositionDetailsStep = ({ formData, setFormData, errors, setErrors }) => {
  const [primarySkillInput, setPrimarySkillInput] = useState('');
  const [secondarySkillInput, setSecondarySkillInput] = useState('');

  


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested form data
    if (name.includes('academicRecords')) {
      const [arrayAndIndex, field] = name.split('.');
      const indexMatch = arrayAndIndex.match(/\[(\d+)\]/);
      const index = indexMatch ? parseInt(indexMatch[1]) : 0;
      setFormData(prev => ({
        ...prev,
        academicRecords: [
          ...prev.academicRecords.slice(0, index),
          { ...prev.academicRecords[index], [field]: value },
          ...prev.academicRecords.slice(index + 1)
        ]
      }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    } else if (name.includes('workExperiences')) {
      const [arrayAndIndex, field] = name.split('.');
      const indexMatch = arrayAndIndex.match(/\[(\d+)\]/);
      const index = indexMatch ? parseInt(indexMatch[1]) : 0;
      setFormData(prev => ({
        ...prev,
        workExperiences: [
          ...prev.workExperiences.slice(0, index),
          { ...prev.workExperiences[index], [field]: value },
          ...prev.workExperiences.slice(index + 1)
        ]
      }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handlePrimarySkillAdd = (e) => {
    const skill = primarySkillInput.trim();
    if (skill) { // If there's text in the input, add the skill
      if (e.key === 'Enter') {
        e.preventDefault(); // Always prevent default when there's text to add
        if (!formData.primarySkills.includes(skill)) { // Only add if it doesn't already exist
          setFormData((prev) => ({
            ...prev,
            primarySkills: [...prev.primarySkills, skill],
          }));
          setPrimarySkillInput('');
        }
      }
    }
  };

  const handleSecondarySkillAdd = (e) => {
    const skill = secondarySkillInput.trim();
    if (skill) { // If there's text in the input, add the skill
      if (e.key === 'Enter') {
        e.preventDefault(); // Always prevent default when there's text to add
        if (!formData.secondarySkills.includes(skill)) { // Only add if it doesn't already exist
          setFormData((prev) => ({
            ...prev,
            secondarySkills: [...prev.secondarySkills, skill],
          }));
          setSecondarySkillInput('');
        }
      }
    }
  };

  const removePrimarySkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      primarySkills: prev.primarySkills.filter((_, i) => i !== index),
    }));
  };

  const removeSecondarySkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      secondarySkills: prev.secondarySkills.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8">
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Academic Records
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          
          {/* Examination Passed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="academicRecords[0].examinationPassed"
                value={formData.academicRecords[0].examinationPassed || ''}
                onChange={handleChange}
                placeholder="Enter Your Heighest Qualification"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.examinationPassed ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.examinationPassed && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.examinationPassed}
              </p>
            )}
          </div>

          {/* Institution Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School / College Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="academicRecords[0].schoolOrCollege"
                value={formData.academicRecords[0].schoolOrCollege || ''}
                onChange={handleChange}
                placeholder="Enter school or college name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.schoolOrCollege ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.schoolOrCollege && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.schoolOrCollege}
              </p>
            )}
          </div>

          {/* Board / University */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board / University <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="academicRecords[0].boardOrUniversity"
                value={formData.academicRecords[0].boardOrUniversity || ''}
                onChange={handleChange}
                placeholder="Enter board or university name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.boardOrUniversity ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.boardOrUniversity && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.boardOrUniversity}
              </p>
            )}
          </div>

          {/* Year of Passing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year of Passing <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="academicRecords[0].yearOfPassing"
                value={formData.academicRecords[0].yearOfPassing || ''}
                onChange={handleChange}
                placeholder="Enter year (e.g. 2024)"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.yearOfPassing ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.yearOfPassing && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.yearOfPassing}
              </p>
            )}
          </div>

          {/* Main Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Stream <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="academicRecords[0].mainSubjects"
                value={formData.academicRecords[0].mainSubjects || ''}
                onChange={handleChange}
                placeholder="Enter main subjects"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.mainSubjects ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.mainSubjects && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.mainSubjects}
              </p>
            )}
          </div>

          {/* Percentage / CGPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Percentage / CGPA <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="number"
                name="academicRecords[0].percentage"
                value={formData.academicRecords[0].percentage || ''}
                onChange={handleChange}
                placeholder="Enter percentage or CGPA"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 text-gray-900 ${errors.percentage ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                step="0.01"
              />
            </div>
            {errors.percentage && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.percentage}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2h4a2 2 0 002-2V8" />
          </svg>
          Position Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Applied For <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="text"
                name="postAppliedFor"
                value={formData.postAppliedFor || ''}
                onChange={handleChange}
                placeholder="Enter position you're applying for"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.postAppliedFor ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.postAppliedFor && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.postAppliedFor}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <div className={`relative rounded-lg transition-all duration-200 ${errors.experienceLevel ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-blue-500'}`}>
              <select
                name="experienceLevel"
                value={formData.experienceLevel || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="">Select experience level</option>
                <option value="beginner">Entry Level</option>
                <option value="intermediate">Mid Level</option>
                <option value="advanced">Senior Level</option>
                <option value="expert">Expert/Lead</option>
              </select>
            </div>
            {errors.experienceLevel && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.experienceLevel}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <div className={`relative rounded-lg transition-all duration-200 ${errors.experience ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-blue-500'}`}>
              <select
                name="experience"
                value={formData.experience || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="">Select experience</option>
                <option value="fresher">Fresher (0 years)</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            {errors.experience && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.experience}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <input
                type="url"
                name="linkedInProfile"
                value={formData.linkedInProfile || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.linkedInProfile ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.linkedInProfile && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.linkedInProfile}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conditionally render work experience fields only if user is not a fresher */}
      {formData.experience !== 'fresher' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2M8 6v2a2 2 0 002 2h4a2 2 0 002-2V8" />
            </svg>
            Work Experience Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg transition-all duration-200">
                <input
                  type="text"
                  name="workExperiences[0].employerName"
                  value={formData.workExperiences[0].employerName || ''}
                  onChange={handleChange}
                  placeholder="Enter employer name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.employerName ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              {errors.employerName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.employerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg transition-all duration-200">
                <input
                  type="text"
                  name="workExperiences[0].designation"
                  value={formData.workExperiences[0].designation || ''}
                  onChange={handleChange}
                  placeholder="Enter your designation"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.designation ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.designation}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration From <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg transition-all duration-200">
                <input
                  type="date"
                  name="workExperiences[0].durationFrom"
                  value={formData.workExperiences[0].durationFrom || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.durationFrom ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              {errors.durationFrom && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.durationFrom}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration To <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg transition-all duration-200">
                <input
                  type="date"
                  name="workExperiences[0].durationTo"
                  value={formData.workExperiences[0].durationTo || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.durationTo ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              {errors.durationTo && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.durationTo}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brief Job Profile <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg transition-all duration-200">
              <textarea
                name="workExperiences[0].briefJobProfile"
                value={formData.workExperiences[0].briefJobProfile || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your job responsibilities and achievements"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 resize-none text-gray-900 ${errors.briefJobProfile ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {errors.briefJobProfile && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.briefJobProfile}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills
        </h3>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Skills <span className="text-red-500">*</span>
          </label>
          <div className="rounded-lg transition-all duration-200">
            <input
              type="text"
              placeholder="Type a skill and press Enter (e.g. Data Structures)"
              value={primarySkillInput}
              onChange={(e) => setPrimarySkillInput(e.target.value)}
              onKeyDown={handlePrimarySkillAdd}
              onInput={(e) => {
                // Handle Android Enter key (IME action) - this catches the Enter key on Android virtual keyboards
                if (e.nativeEvent.inputType === 'insertLineBreak') {
                  handlePrimarySkillAdd(e);
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.primarySkills ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            />
            <div className="mt-2 flex justify-start sm:justify-start">
              <button
                type="button"
                onClick={() => {
                  // Add skills when button is clicked
                  const input = primarySkillInput.trim();
                  if (input) {
                    // Split by comma to allow multiple skills at once
                    const skillsToAdd = input.split(',').map(skill => skill.trim()).filter(skill => skill);
                    
                    setFormData(prev => {
                      const updatedSkills = [...prev.primarySkills];
                      skillsToAdd.forEach(skill => {
                        if (!updatedSkills.includes(skill)) {
                          updatedSkills.push(skill);
                        }
                      });
                      return { ...prev, primarySkills: updatedSkills };
                    });
                    
                    setPrimarySkillInput(''); // Clear the input field
                  }
                }}
                className="w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm whitespace-nowrap"
              >
                Add Skill{primarySkillInput.split(',').filter(skill => skill.trim()).length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
          
          {/* Skill tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.primarySkills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removePrimarySkill(index)}
                  className="text-blue-600 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          
          {errors.primarySkills && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.primarySkills}
            </p>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Skills <span className="text-red-500">*</span>
          </label>
          <div className="rounded-lg transition-all duration-200">
            <input
              type="text"
              placeholder="Type a skill and press Enter (e.g. REST APIs)"
              value={secondarySkillInput}
              onChange={(e) => setSecondarySkillInput(e.target.value)}
              onKeyDown={handleSecondarySkillAdd}
              onInput={(e) => {
                // Handle Android Enter key (IME action) - this catches the Enter key on Android virtual keyboards
                if (e.nativeEvent.inputType === 'insertLineBreak') {
                  handleSecondarySkillAdd(e);
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all text-gray-900 ${errors.secondarySkills ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
            />
            <div className="mt-2 flex justify-start sm:justify-start">
              <button
                type="button"
                onClick={() => {
                  // Add skills when button is clicked
                  const input = secondarySkillInput.trim();
                  if (input) {
                    // Split by comma to allow multiple skills at once
                    const skillsToAdd = input.split(',').map(skill => skill.trim()).filter(skill => skill);
                    
                    setFormData(prev => {
                      const updatedSkills = [...prev.secondarySkills];
                      skillsToAdd.forEach(skill => {
                        if (!updatedSkills.includes(skill)) {
                          updatedSkills.push(skill);
                        }
                      });
                      return { ...prev, secondarySkills: updatedSkills };
                    });
                    
                    setSecondarySkillInput(''); // Clear the input field
                  }
                }}
                className="w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm whitespace-nowrap"
              >
                Add Skill{secondarySkillInput.split(',').filter(skill => skill.trim()).length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
          
          {/* Skill tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.secondarySkills.map((skill, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSecondarySkill(index)}
                  className="text-green-600 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          
          {errors.secondarySkills && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.secondarySkills}
            </p>
          )}
        </div>
      </div>
      
      {/* Resume Upload Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resume
        </h3>
        
        <ResumeUpload resume={formData.resume} setResume={(file) => setFormData(prev => ({ ...prev, resume: file }))} errors={errors} setErrors={setErrors} />
      </div>
    </div>
  );
};

export default PositionDetailsStep;