const SkillsSection = ({ applicant }) => {
  const hasSkills = (applicant.primarySkills && applicant.primarySkills.length > 0) || 
                   (applicant.secondarySkills && applicant.secondarySkills.length > 0) || 
                   applicant.experienceLevel;

  if (!hasSkills) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Skills & Experience</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Skills */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Primary Skills</h4>
          {applicant.primarySkills && applicant.primarySkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {applicant.primarySkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No primary skills listed</p>
          )}
        </div>
        
        {/* Secondary Skills */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Secondary Skills</h4>
          {applicant.secondarySkills && applicant.secondarySkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {applicant.secondarySkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No secondary skills listed</p>
          )}
        </div>
        
        {/* Experience Level */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Experience Level</h4>
          {applicant.experienceLevel ? (
            <div className="flex flex-wrap gap-2">
              <span 
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {applicant.experienceLevel}
              </span>
            </div>
          ) : (
            <p className="text-gray-500 italic">No experience level specified</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;