import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import StarRating from '../../components/StarRating';
import AdminLayout from '../../components/AdminLayout';

const ModernApplicantsPage = () => {
  const navigate = useNavigate();
  const { applicants } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Calculate unique positions for filter dropdown
  const uniquePositions = useMemo(() => {
    const positions = new Set(applicants.map(applicant => applicant.postAppliedFor || applicant.position || 'Unknown'));
    return ['all', ...Array.from(positions)];
  }, [applicants]);


  // Filter applicants based on search term and filters
  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesSearch = 
        (applicant.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.postAppliedFor || applicant.position || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'completed' && (applicant.testData || applicant.rating !== undefined || applicant.correctAnswer !== undefined)) ||
        (statusFilter === 'pending' && !applicant.testData && applicant.rating === undefined && applicant.correctAnswer === undefined);
      
      const matchesPosition = positionFilter === 'all' || 
        (positionFilter === (applicant.postAppliedFor || applicant.position || 'Unknown'));

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [applicants, searchTerm, statusFilter, positionFilter]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to extract numeric score from test data
  const getNumericScore = (applicant) => {
    // First check if the applicant has a rating field (new API structure)
    if (applicant.rating !== undefined && applicant.rating !== null) {
      // Convert rating out of 5 to percentage (e.g., 4/5 = 80%)
      return (applicant.rating / 5) * 100;
    }
    
    // If no rating, check for correctAnswer field (new API structure)
    if (applicant.correctAnswer !== undefined && applicant.testData?.totalQuestions) {
      // Calculate percentage from correct answers
      return (applicant.correctAnswer / applicant.testData.totalQuestions) * 100;
    }
    
    // If no new fields, fall back to old testData structure
    const testData = applicant.testData;
    if (!testData) return 0;
    
    // If score is in X/Y format (e.g., "7/15"), extract the percentage
    if (typeof testData.score === 'string' && testData.score.includes('/')) {
      const [correct, total] = testData.score.split('/').map(Number);
      if (total > 0) {
        return (correct / total) * 100;
      }
    }
    
    // If percentage is available directly
    if (testData.percentage) {
      return parseFloat(testData.percentage);
    }
    
    // If score is available directly
    if (testData.score && typeof testData.score === 'number') {
      return testData.score;
    }
    
    // If test data contains correctAnswers and totalQuestions
    if (testData.correctAnswers !== undefined && testData.totalQuestions) {
      return (testData.correctAnswers / testData.totalQuestions) * 100;
    }
    
    return 0;
  };

  return (
    <AdminLayout activeTab="applicants">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Applicants</h1>
          <p className="text-gray-600">Manage and review all applicant information</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applicants.filter(a => a.testData || a.rating !== undefined || a.correctAnswer !== undefined).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applicants.filter(a => !a.testData && a.rating === undefined && a.correctAnswer === undefined).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applicants.length > 0 
                    ? (applicants.filter(a => a.testData || a.rating !== undefined || a.correctAnswer !== undefined)
                        .reduce((sum, a) => sum + getNumericScore(a), 0) / 
                       applicants.filter(a => a.testData || a.rating !== undefined || a.correctAnswer !== undefined).length
                      ).toFixed(1) + '%'
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed Test</option>
                <option value="pending">Pending Test</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {uniquePositions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredApplicants.length}</span> applicants
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500">Loading applicants...</p>
              </div>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant._id || applicant.id || applicant.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(applicant.fullName || 'A').charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{applicant.fullName}</div>
                            <div className="text-sm text-gray-500">{applicant.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{applicant.postAppliedFor || applicant.position || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{applicant.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (applicant.testData || applicant.rating !== undefined || applicant.correctAnswer !== undefined)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(applicant.testData || applicant.rating !== undefined || applicant.correctAnswer !== undefined) ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.testData || applicant.rating !== undefined || applicant.correctAnswer !== undefined ? (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {getNumericScore(applicant).toFixed(1)}%
                            </span>
                            {applicant.rating && <StarRating rating={applicant.rating} maxRating={5} />}
                            {applicant.correctAnswer && applicant.testData?.totalQuestions && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({applicant.correctAnswer}/{applicant.testData.totalQuestions})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No test</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/applicant/${applicant._id || applicant.id || applicant.email}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ModernApplicantsPage;