import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getAllFeedback, getAllTestResults } from '../../api';
import StarRating from '../../components/StarRating';

const ModernApplicantsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicants, loading: applicantsLoading, isAdminAuthenticated, adminLogout } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');



  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Function to manually fetch feedback data
  const fetchFeedback = async () => {
    if (!isAdminAuthenticated) return;
    
    setIsFeedbackLoading(true);
    try {
      const data = await getAllFeedback();
      setFeedbackData(data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      setFeedbackData([]);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // Function to fetch all test results
  const fetchTestResults = async () => {
    if (!isAdminAuthenticated) return;
    
    try {
      const data = await getAllTestResults();
      setTestResults(data);
    } catch (error) {
      console.error('Failed to fetch test results:', error);
      setTestResults([]);
    }
  };

  // Fetch feedback and test results data on component mount only once
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchFeedback();
      fetchTestResults();
    }
  }, []);

  // Combine applicants with feedback and test result data
  const combinedApplicants = useMemo(() => {
    return applicants.map(applicant => {
      // Look for feedback associated with this applicant
      const applicantFeedback = feedbackData.find(feedback => 
        feedback.email === applicant.email || feedback.name === applicant.fullName
      );
      
      // Look for test result associated with this applicant by fullName or id
      const applicantTestResult = testResults.find(testResult => 
        testResult.fullName === applicant.fullName || testResult.fullName === applicant.name || testResult.id === applicant.id
      );
      
      // Extract test result data from various possible locations
      const testResult = applicant.testResult || applicant.testData || applicant.test || applicant.result || applicantTestResult || {};
      
      // Extract correct answers from various possible locations
      const correctAnswers = applicantTestResult?.correctAnswer || // Prioritize from test results API
                            applicant.correctAnswer || 
                            testResult.correctAnswers || 
                            testResult.correctAnswer || 
                            (applicant.testData && (applicant.testData.correctAnswers || applicant.testData.correctAnswer)) ||
                            (applicant.test && (applicant.test.correctAnswers || applicant.test.correctAnswer)) ||
                            (applicant.testResult && (applicant.testResult.correctAnswers || applicant.testResult.correctAnswer)) ||
                            (applicant.result && (applicant.result.correctAnswers || applicant.result.correctAnswer)) ||
                            (testResult && (testResult.correctAnswers || testResult.correctAnswer)) ||
                            null;
      
      // Extract percentage from various possible locations
      const percentage = applicant.percentage ||
                         testResult.percentage ||
                         testResult.overallPercentage ||
                         (applicant.testData && (applicant.testData.percentage || applicant.testData.overallPercentage)) ||
                         (applicant.test && (applicant.test.percentage || applicant.test.overallPercentage)) ||
                         (applicant.testResult && (applicant.testResult.percentage || applicant.testResult.overallPercentage)) ||
                         (applicant.result && (applicant.result.percentage || applicant.result.overallPercentage)) ||
                         null;
      
      // Extract score from various possible locations
      const score = applicant.score ||
                    testResult.score ||
                    (applicant.testData && applicant.testData.score) ||
                    (applicant.test && applicant.test.score) ||
                    (applicant.testResult && applicant.testResult.score) ||
                    (applicant.result && applicant.result.score) ||
                    null;
      
      // Check if test is completed based on multiple possible indicators
      const isTestCompleted = applicant.testCompletedAt ||
                              applicant.testCompleted ||
                              applicantTestResult || // If test result exists from API
                              (applicant.testData && Object.keys(applicant.testData).length > 0) ||
                              (applicant.testResult && Object.keys(applicant.testResult).length > 0) ||
                              (applicant.test && Object.keys(applicant.test).length > 0) ||
                              (applicant.result && Object.keys(applicant.result).length > 0) ||
                              correctAnswers !== null ||
                              percentage !== null ||
                              score !== null ||
                              (applicant.correctAnswer !== undefined && applicant.correctAnswer !== null) ||
                              (applicant.testData && applicant.testData.correctAnswers !== undefined) ||
                              (applicant.testData && applicant.testData.percentage !== undefined);
      
      return {
        ...applicant,
        feedback: applicantFeedback || null,
        testResultFromAPI: applicantTestResult, // Store the specific test result from API
        // Use existing testData, or null
        testData: applicant.testData || applicant.testResult || applicant.test || applicant.result || null,
        testResult: testResult,
        // Include rating and correctAnswer from applicant
        rating: applicant.rating || applicant.overallRating,
        correctAnswer: correctAnswers,
        percentage: percentage,
        score: score,
        testCompletedAt: applicant.testCompletedAt,
        isTestCompleted: isTestCompleted,
        // If feedback exists, use its rating; otherwise undefined
        overallRating: applicantFeedback ? applicantFeedback.rating : (applicant.rating || applicant.overallRating)
      };
    });
  }, [applicants, feedbackData, testResults]);

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = [...new Set(combinedApplicants.map(applicant => applicant.postAppliedFor || applicant.position))];
    return ['all', ...positions.filter(pos => pos)];
  }, [combinedApplicants]);

  // Filter applicants based on search term and filters
  const filteredApplicants = useMemo(() => {
    let filtered = combinedApplicants;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(applicant => 
        applicant.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.postAppliedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(applicant => {
        const hasTestData = applicant.testData || applicant.correctAnswer !== undefined;
        if (statusFilter === 'completed') return hasTestData;
        if (statusFilter === 'pending') return !hasTestData;
        return true;
      });
    }
    
    // Apply position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(applicant => 
        (applicant.postAppliedFor || applicant.position) === positionFilter
      );
    }
    
    return filtered;
  }, [combinedApplicants, searchTerm, statusFilter, positionFilter]);

  // Navigation highlighting
  const isActive = (path) => {
    if (path === '/admin/modern') {
      // For Overview, only highlight if exact match (not for sub-paths like /admin/modern/applicants)
      return location.pathname === path;
    }
    // For other paths, use includes to handle sub-paths
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  // Navigation items
  const navItems = [
    { name: 'Overview', icon: '📊', path: '/admin/modern' },
    { name: 'Applicants', icon: '👥', path: '/admin/modern/applicants' },
    { name: 'Analytics', icon: '📈', path: '/admin/modern/analytics' },
    { name: 'Feedback', icon: '💬', path: '/admin/modern/feedback' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">EA</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Elite Associate</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`lg:ml-64 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'} lg:ml-64`}>
        {/* Top Navigation */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    All Applicants
                  </h1>
                  <p className="text-sm text-gray-500">Manage all recruitment applicants</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {uniquePositions.map(position => (
                    <option key={position} value={position}>
                      {position === 'all' ? 'All Positions' : position}
                    </option>
                  ))}
                </select>



                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchFeedback}
                    disabled={isFeedbackLoading}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh data"
                  >
                    {isFeedbackLoading ? (
                      <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">System Administrator</p>
                  </div>
                  <div className="w-10 h-10 relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full group-hover:shadow-lg group-hover:shadow-purple-300/50 transition-all"></div>
                    <div className="relative w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                      AU
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Applicants Content */}
        <main className="p-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Applicant Management</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{filteredApplicants.length} applicants</span>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all">
                  Add Applicant
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((applicant, index) => (
                      <tr key={applicant._id || applicant.id || applicant.email || `applicant-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {(applicant.fullName || applicant.name || 'A').charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{applicant.fullName || applicant.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{applicant.permanentEmail || applicant.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{applicant.postAppliedFor || applicant.position || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {applicant.isTestCompleted ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {applicant.score ? (
                            <span className="font-bold">{applicant.score}</span>
                          ) : applicant.percentage !== undefined && applicant.percentage !== null ? (
                            <span className="font-bold">{applicant.percentage}%</span>
                          ) : applicant.correctAnswer !== undefined && applicant.testData?.totalQuestions ? (
                            <span className="font-bold">{applicant.correctAnswer}/{applicant.testData.totalQuestions} ({((applicant.correctAnswer / applicant.testData.totalQuestions) * 100).toFixed(1)}%)</span>
                          ) : applicant.correctAnswer !== undefined ? (
                            <span className="font-bold">{applicant.correctAnswer} correct</span>
                          ) : applicant.testData?.correctAnswers !== undefined && applicant.testData?.totalQuestions ? (
                            <span className="font-bold">{applicant.testData.correctAnswers}/{applicant.testData.totalQuestions} ({((applicant.testData.correctAnswers / applicant.testData.totalQuestions) * 100).toFixed(1)}%)</span>
                          ) : applicant.testData?.correctAnswers !== undefined ? (
                            <span className="font-bold">{applicant.testData.correctAnswers} correct</span>
                          ) : applicant.testResult?.correctAnswers !== undefined && applicant.testResult?.totalQuestions ? (
                            <span className="font-bold">{applicant.testResult.correctAnswers}/{applicant.testResult.totalQuestions} ({((applicant.testResult.correctAnswers / applicant.testResult.totalQuestions) * 100).toFixed(1)}%)</span>
                          ) : applicant.testResult?.correctAnswers !== undefined ? (
                            <span className="font-bold">{applicant.testResult.correctAnswers} correct</span>
                          ) : applicant.test?.correctAnswers !== undefined && applicant.test?.totalQuestions ? (
                            <span className="font-bold">{applicant.test.correctAnswers}/{applicant.test.totalQuestions} ({((applicant.test.correctAnswers / applicant.test.totalQuestions) * 100).toFixed(1)}%)</span>
                          ) : applicant.test?.correctAnswers !== undefined ? (
                            <span className="font-bold">{applicant.test.correctAnswers} correct</span>
                          ) : applicant.result?.correctAnswers !== undefined && applicant.result?.totalQuestions ? (
                            <span className="font-bold">{applicant.result.correctAnswers}/{applicant.result.totalQuestions} ({((applicant.result.correctAnswers / applicant.result.totalQuestions) * 100).toFixed(1)}%)</span>
                          ) : applicant.result?.correctAnswers !== undefined ? (
                            <span className="font-bold">{applicant.result.correctAnswers} correct</span>
                          ) : applicant.rating !== undefined && applicant.rating !== null ? (
                            <span className="font-bold">{((applicant.rating / 5) * 100).toFixed(1)}%</span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(applicant.rating !== undefined && applicant.rating > 0) || (applicant.overallRating !== undefined && applicant.overallRating > 0) ? (
                            <StarRating rating={applicant.rating || applicant.overallRating} maxRating={5} />
                          ) : (
                            <span className="text-gray-500 text-sm">No rating</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(applicant.submittedAt || applicant.createdAt || new Date(0)).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/applicant/${encodeURIComponent(applicant.fullName || applicant.name || 'Unknown')}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernApplicantsPage;