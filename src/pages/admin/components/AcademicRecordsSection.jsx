const AcademicRecordsSection = ({ applicant }) => {
  if (!applicant.academicRecords || applicant.academicRecords.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Records</h3>
      <div className="space-y-4">
        {applicant.academicRecords.map((record, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Board/University</span>
                <p className="font-medium">{record.boardOrUniversity || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Examination</span>
                <p className="font-medium">{record.examinationPassed || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Main Subjects</span>
                <p className="font-medium">{record.mainSubjects || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Percentage</span>
                <p className="font-medium">{record.percentage || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Institution</span>
                <p className="font-medium">{record.schoolOrCollege || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Year of Passing</span>
                <p className="font-medium">{record.yearOfPassing || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicRecordsSection;