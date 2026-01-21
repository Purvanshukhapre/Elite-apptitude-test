const WorkExperienceSection = ({ applicant }) => {
  if (!applicant.workExperiences || applicant.workExperiences.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Work Experience</h3>
      <div className="space-y-4">
        {applicant.workExperiences.map((exp, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Employer</span>
                <p className="font-medium">{exp.employerName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Designation</span>
                <p className="font-medium">{exp.designation || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Duration</span>
                <p className="font-medium">{exp.durationFrom || 'N/A'} to {exp.durationTo || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Joining Date</span>
                <p className="font-medium">{exp.joiningDate || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Last Date</span>
                <p className="font-medium">{exp.lastDate || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Salary</span>
                <p className="font-medium">{exp.totalSalary || 'N/A'}</p>
              </div>
              <div className="md:col-span-3">
                <span className="text-gray-600 text-sm">Job Profile</span>
                <p className="font-medium">{exp.briefJobProfile || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperienceSection;