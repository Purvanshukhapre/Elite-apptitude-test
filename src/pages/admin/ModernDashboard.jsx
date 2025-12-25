import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';

const ModernDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicants, isAdminAuthenticated, adminLogout } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Fetch feedback data on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const data = await getAllFeedback();
        setFeedbackData(data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setFeedbackData([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdminAuthenticated) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [isAdminAuthenticated]);

  // Combine applicants with feedback data
  const combinedApplicants = useMemo(() => {
    return applicants.map(applicant => {
      // Look for feedback associated with this applicant
      const applicantFeedback = feedbackData.find(feedback => 
        feedback.email === applicant.email || feedback.name === applicant.fullName
      );
      
      return {
        ...applicant,
        feedback: applicantFeedback || null,
        // Use existing testData, or null
        testData: applicant.testData || null,
        // Include rating and correctAnswer from applicant
        rating: applicant.rating,
        correctAnswer: applicant.correctAnswer !== undefined 
          ? applicant.correctAnswer 
          : (applicant.testData?.correctAnswers !== undefined 
            ? applicant.testData.correctAnswers 
            : applicant.correctAnswer),
        // If feedback exists, use its rating; otherwise undefined
        overallRating: applicantFeedback ? applicantFeedback.rating : undefined
      };
    });
  }, [applicants, feedbackData]);

  // Filter applicants based on search term
  const filteredApplicants = useMemo(() => {
    if (!searchTerm) return combinedApplicants;
    
    return combinedApplicants.filter(applicant => 
      applicant.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.postAppliedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinedApplicants, searchTerm]);

  // Analytics data
  const analytics = useMemo(() => {
    const total = combinedApplicants.length;
    const withTest = combinedApplicants.filter(a => a.testData).length;
    const withFeedback = combinedApplicants.filter(a => a.feedback).length;
    const pending = total - withTest;
    
    // Score distribution
    const excellent = combinedApplicants.filter(a => getNumericScore(a) >= 80).length;
    const good = combinedApplicants.filter(a => getNumericScore(a) >= 60 && getNumericScore(a) < 80).length;
    const average = combinedApplicants.filter(a => getNumericScore(a) >= 40 && getNumericScore(a) < 60).length;
    const poor = combinedApplicants.filter(a => getNumericScore(a) < 40).length;
    
    // Average metrics
    const avgScore = withTest > 0
      ? (combinedApplicants.filter(a => a.testData || a.rating !== undefined || a.correctAnswer !== undefined).reduce((sum, a) => sum + getNumericScore(a), 0) / withTest).toFixed(1)
      : 0;
      
    const avgTimeSpent = withTest > 0
      ? Math.round(combinedApplicants.filter(a => a.testData).reduce((sum, a) => sum + (a.testData.timeSpent || 0), 0) / withTest / 60)
      : 0;
    
    // Completion rate
    const completionRate = total > 0 ? ((withTest / total) * 100).toFixed(1) : 0;
    const feedbackRate = withTest > 0 ? ((withFeedback / withTest) * 100).toFixed(1) : 0;

    return {
      total,
      withTest,
      withFeedback,
      pending,
      excellent,
      good,
      average,
      poor,
      avgScore,
      avgTimeSpent,
      completionRate,
      feedbackRate
    };
  }, [combinedApplicants]);

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
                    Dashboard Overview
                  </h1>
                  <p className="text-sm text-gray-500">Elite Associate Recruitment Platform</p>
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



                <div className="flex items-center space-x-3">
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

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span>+{analytics.total > 0 ? Math.floor(analytics.total * 0.1) : 0} this month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.withTest}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${analytics.completionRate}%`}}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-600">{analytics.completionRate}%</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgScore}%</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 font-semibold">
                <span>Avg time: {analytics.avgTimeSpent}m</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Excellent</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.excellent}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-amber-600 font-semibold">
                <span>{analytics.excellent > 0 ? ((analytics.excellent / analytics.withTest) * 100).toFixed(1) : 0}% of tested</span>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Performance Distribution</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-600">Excellent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Good</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Average</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Needs Work</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray={`${(analytics.excellent / analytics.withTest) * 100 || 0}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-600">{analytics.excellent}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900">Excellent</h4>
                  <p className="text-sm text-gray-500">80-100%</p>
                </div>
                
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray={`${(analytics.good / analytics.withTest) * 100 || 0}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-600">{analytics.good}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900">Good</h4>
                  <p className="text-sm text-gray-500">60-79%</p>
                </div>
                
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray={`${(analytics.average / analytics.withTest) * 100 || 0}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{analytics.average}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900">Average</h4>
                  <p className="text-sm text-gray-500">40-59%</p>
                </div>
                
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeDasharray={`${(analytics.poor / analytics.withTest) * 100 || 0}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-red-600">{analytics.poor}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900">Needs Work</h4>
                  <p className="text-sm text-gray-500">&lt;40%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Feedback Rate</span>
                  <span className="font-bold text-indigo-600">{analytics.feedbackRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Tests</span>
                  <span className="font-bold text-amber-600">{analytics.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">High Performers</span>
                  <span className="font-bold text-green-600">{analytics.excellent + analytics.good}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Rating</span>
                  <span className="font-bold text-purple-600">
                    {(() => {
                      const ratedApplicants = combinedApplicants.filter(a => a.rating !== undefined && a.rating !== 0);
                      if (ratedApplicants.length === 0) return '0.0';
                      const totalRating = ratedApplicants.reduce((sum, a) => sum + (a.rating || 0), 0);
                      const avgRating = totalRating / ratedApplicants.length;
                      return avgRating.toFixed(1);
                    })()}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applicants Table */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Applicants</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{filteredApplicants.length} applicants</span>
                <button 
                  onClick={() => navigate('/admin/modern/applicants')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all text-sm"
                >
                  View All
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500">Loading applicants...</p>
                </div>
              </div>
            ) : (
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplicants.slice(0, 4).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplicants.slice(0, 4).map((applicant, index) => (
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
                                <div className="text-sm text-gray-500">{applicant.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{applicant.postAppliedFor || applicant.position || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(applicant.testData || applicant.correctAnswer !== undefined) ? (
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
                            {applicant.testData?.percentage !== undefined ? (
                              <span className="font-bold">{applicant.testData.percentage}%</span>
                            ) : applicant.correctAnswer !== undefined && applicant.testData?.totalQuestions ? (
                              <span className="font-bold">{applicant.correctAnswer}/{applicant.testData.totalQuestions} ({((applicant.correctAnswer / applicant.testData.totalQuestions) * 100).toFixed(1)}%)</span>
                            ) : applicant.correctAnswer !== undefined ? (
                              <span className="font-bold">{applicant.correctAnswer} correct</span>
                            ) : applicant.rating !== undefined && applicant.rating !== null ? (
                              <span className="font-bold">{((applicant.rating / 5) * 100).toFixed(1)}%</span>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {applicant.rating !== undefined && applicant.rating > 0 ? (
                              <StarRating rating={applicant.rating} maxRating={5} />
                            ) : (
                              <span className="text-gray-500 text-sm">No rating</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(applicant.submittedAt || applicant.createdAt || new Date(0)).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernDashboard;