import { useState } from 'react';
import { positions } from '../../data/questions';

const PositionDetailsStep = ({ formData, setFormData, errors, setErrors }) => {
  const [primarySkillInput, setPrimarySkillInput] = useState('');
  const [secondarySkillInput, setSecondarySkillInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePrimarySkillAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = primarySkillInput.trim();
      if (skill && !formData.primarySkills.includes(skill)) {
        setFormData((prev) => ({
          ...prev,
          primarySkills: [...prev.primarySkills, skill],
        }));
        setPrimarySkillInput('');
      }
    }
  };

  const handleSecondarySkillAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = secondarySkillInput.trim();
      if (skill && !formData.secondarySkills.includes(skill)) {
        setFormData((prev) => ({
          ...prev,
          secondarySkills: [...prev.secondarySkills, skill],
        }));
        setSecondarySkillInput('');
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
    <div>
      <div className="mt-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Academic Records
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Institution Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School / College Name <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.institution ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <input
                type="text"
                name="institution"
                value={formData.institution || ''}
                onChange={handleChange}
                placeholder="Enter school or college name"
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              />
            </div>
            {errors.institution && (
              <p className="text-red-500 text-sm mt-1">{errors.institution}</p>
            )}
          </div>

          {/* Board / University Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board / University <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.boardType ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <select
                name="boardType"
                value={formData.boardType || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              >
                <option value="">Select board / university type</option>
                <option value="School">School</option>
                <option value="University">University</option>
              </select>
            </div>
            {errors.boardType && (
              <p className="text-red-500 text-sm mt-1">{errors.boardType}</p>
            )}
          </div>

          {/* Name of Board / University */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Board / University <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.boardName ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <input
                type="text"
                name="boardName"
                value={formData.boardName || ''}
                onChange={handleChange}
                placeholder="Enter board or university name"
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              />
            </div>
            {errors.boardName && (
              <p className="text-red-500 text-sm mt-1">{errors.boardName}</p>
            )}
          </div>

          {/* Examination Passed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Examination Passed <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.examPassed ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <input
                type="text"
                name="examPassed"
                value={formData.examPassed || ''}
                onChange={handleChange}
                placeholder="Enter exam passed"
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              />
            </div>
            {errors.examPassed && (
              <p className="text-red-500 text-sm mt-1">{errors.examPassed}</p>
            )}
          </div>

          {/* Year of Passing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Passing <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.yearOfPassing ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <select
                name="yearOfPassing"
                value={formData.yearOfPassing || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              >
                <option value="">Select year or pursuing</option>
                <option value="Pursuing">Pursuing</option>
                {Array.from({ length: 50 }, (_, i) => 1975 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {errors.yearOfPassing && (
              <p className="text-red-500 text-sm mt-1">{errors.yearOfPassing}</p>
            )}
          </div>

          {/* Main Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Subjects <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.mainSubjects ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <input
                type="text"
                name="mainSubjects"
                value={formData.mainSubjects || ''}
                onChange={handleChange}
                placeholder="Enter main subjects"
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              />
            </div>
            {errors.mainSubjects && (
              <p className="text-red-500 text-sm mt-1">{errors.mainSubjects}</p>
            )}
          </div>

          {/* Percentage / CGPA */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage / CGPA <span className="text-red-500">*</span>
            </label>
            <div
              className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-300 transition ${
                errors.percentage ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <input
                type="number"
                name="percentage"
                value={formData.percentage || ''}
                onChange={handleChange}
                placeholder="Enter percentage or CGPA"
                className="w-full px-3 py-2 bg-transparent outline-none border-none placeholder-gray-400"
              />
            </div>
            {errors.percentage && (
              <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Position Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Applied For *
            </label>
            <select
              name="position"
              value={formData.position || ''}
              onChange={handleChange}
              className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                errors.position ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <option value="">Select a position</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience *
            </label>
            <select
              name="experience"
              value={formData.experience || ''}
              onChange={handleChange}
              className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                errors.experience ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <option value="">Select experience</option>
              <option value="fresher">Fresher (0 years)</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
            {errors.experience && (
              <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Previous Job Duration *
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                From
              </label>
              <textarea
                name="experienceFromText"
                value={formData.experienceFromText || ''}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Jan 2021"
                className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                  errors.experienceFromText ? 'border-red-500' : 'border-gray-500'
                }`}
              />
              {errors.experienceFromText && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.experienceFromText}
                </p>
              )}
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                To
              </label>
              <textarea
                name="experienceToText"
                value={formData.experienceToText || ''}
                onChange={handleChange}
                rows={1}
                placeholder="e.g. Mar 2024 / Present"
                className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                  errors.experienceToText ? 'border-red-500' : 'border-gray-500'
                }`}
              />
              {errors.experienceToText && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.experienceToText}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Example: <span className="italic">Jan 2021 – Mar 2024</span> or <span className="italic">Present</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Salary (Optional)
          </label>
          <input
            type="text"
            name="expectedSalary"
            value={formData.expectedSalary || ''}
            onChange={handleChange}
            className="w-full h-10 px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="e.g., $50,000 - $70,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Linkdin (Optional)
          </label>
          <input
            type="url"
            name="resumeLink"
            value={formData.resumeLink || ''}
            onChange={handleChange}
            className="w-full h-10 px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="linkdin profile..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Previous Job Details
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Designation */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Designation *
              </label>
              <textarea
                name="designation"
                value={formData.designation || ''}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Junior Software Developer"
                className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                  errors.designation ? 'border-red-500' : 'border-gray-500'
                }`}
              />
              {errors.designation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.designation}
                </p>
              )}
            </div>

            {/* Brief Job Profile */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Brief Job Profile *
              </label>
              <textarea
                name="briefJobProfile"
                value={formData.briefJobProfile || ''}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Worked on REST APIs and database integration"
                className={`w-full h-10 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none transition ${
                  errors.briefJobProfile ? 'border-red-500' : 'border-gray-500'
                }`}
              />
              {errors.briefJobProfile && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.briefJobProfile}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Skills (Learned in College)
          </label>

          <textarea
            rows={2}
            placeholder="Type a skill and press Enter (e.g. Data Structures)"
            value={primarySkillInput}
            onChange={(e) => setPrimarySkillInput(e.target.value)}
            onKeyDown={handlePrimarySkillAdd}
            className="w-full h-10 px-4 py-2 border border-gray-500 rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none"
          />

          {/* Skill tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.primarySkills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removePrimarySkill(index)}
                  className="text-blue-500 hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Skills (Applied in Work Experience)
            </label>

            <textarea
              rows={2}
              placeholder="Type a skill and press Enter (e.g. REST APIs)"
              value={secondarySkillInput}
              onChange={(e) => setSecondarySkillInput(e.target.value)}
              onKeyDown={handleSecondarySkillAdd}
              className="w-full h-10 px-4 py-2 border border-gray-500 rounded-lg resize-none focus:ring-2 focus:ring-blue-300 outline-none"
            />

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.secondarySkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSecondarySkill(index)}
                    className="text-green-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level *
            </label>

            <select
              name="experienceLevel"
              value={formData.experienceLevel || ''}
              onChange={handleChange}
              className={`w-full h-10 px-4 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition ${
                errors.experienceLevel ? 'border-red-500' : 'border-gray-500'
              }`}
            >
              <option value="">Select experience level</option>
              <option value="beginner">Entry</option>
              <option value="intermediate">mid-senior</option>
              <option value="advanced">senior</option>
              <option value="expert">lead</option>
              <option value="expert">principle</option>
            </select>

            {errors.experienceLevel && (
              <p className="text-red-500 text-sm mt-1">
                {errors.experienceLevel}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionDetailsStep;