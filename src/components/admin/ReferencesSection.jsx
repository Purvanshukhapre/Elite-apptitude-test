const ReferencesSection = ({ applicant }) => {
  const hasReferences = applicant.reference1Name || applicant.reference2Name;

  if (!hasReferences) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">References</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applicant.reference1Name && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h4 className="font-bold text-gray-800 mb-3">Reference 1</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Name</span>
                <span className="font-medium">{applicant.reference1Name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Mobile</span>
                <span className="font-medium">{applicant.reference1Mobile}</span>
              </div>
            </div>
          </div>
        )}
        {applicant.reference2Name && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h4 className="font-bold text-gray-800 mb-3">Reference 2</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Name</span>
                <span className="font-medium">{applicant.reference2Name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Mobile</span>
                <span className="font-medium">{applicant.reference2Mobile}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencesSection;