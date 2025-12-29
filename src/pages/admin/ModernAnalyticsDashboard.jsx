import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';
import AdminLayout from '../../components/AdminLayout';

const ModernAnalyticsDashboard = () => {
  const { applicants, isAdminAuthenticated } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);

  const [timeRange, setTimeRange] = useState('7d');

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
      try {
        const data = await getAllFeedback();
        setFeedbackData(data);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
        setFeedbackData([]);
      }
    };
    
    if (isAdminAuthenticated) {
      fetchFeedback();
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

    // Position breakdown
    const positionStats = {};
    combinedApplicants.forEach(a => {
      const position = a.postAppliedFor || a.position || 'Unknown';
      if (!positionStats[position]) {
        positionStats[position] = { total: 0, tested: 0, avgScore: 0, scores: [] };
      }
      positionStats[position].total++;
      if (a.testData || a.rating !== undefined || a.correctAnswer !== undefined) {
        positionStats[position].tested++;
        positionStats[position].scores.push(getNumericScore(a));
      }
    });

    Object.keys(positionStats).forEach(pos => {
      const scores = positionStats[pos].scores;
      positionStats[pos].avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

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
      feedbackRate,
      positionStats
    };
  }, [combinedApplicants]);


  return (
    <AdminLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500">Detailed recruitment analytics and insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </header>

        {/* Analytics Content */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2">
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
                      <span className="text-sm sm:text-lg font-bold text-amber-600">{analytics.excellent}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Excellent</h4>
                  <p className="text-xs text-gray-500">80-100%</p>
                </div>
                
                <div className="text-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2">
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
                      <span className="text-sm sm:text-lg font-bold text-green-600">{analytics.good}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Good</h4>
                  <p className="text-xs text-gray-500">60-79%</p>
                </div>
                
                <div className="text-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2">
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
                      <span className="text-sm sm:text-lg font-bold text-blue-600">{analytics.average}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Average</h4>
                  <p className="text-xs text-gray-500">40-59%</p>
                </div>
                
                <div className="text-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2">
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
                      <span className="text-sm sm:text-lg font-bold text-red-600">{analytics.poor}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Needs Work</h4>
                  <p className="text-xs text-gray-500">&lt;40%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Position Performance</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(analytics.positionStats).map(([position, stats]) => (
                  <div key={position} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-sm">{position}</h4>
                      <p className="text-xs text-gray-500">{stats.tested}/{stats.total} tested</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-blue-600">{stats.avgScore}%</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{stats.tested > 0 ? ((stats.tested / stats.total) * 100).toFixed(1) : 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Trend Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Score Trends</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full max-w-4xl">
                {/* SVG Chart */}
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="750" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="60" x2="750" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="100" x2="750" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="140" x2="750" y2="140" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="180" x2="750" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                  
                  {/* X Axis */}
                  <line x1="50" y1="180" x2="750" y2="180" stroke="#9ca3af" strokeWidth="2" />
                  
                  {/* Y Axis */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#9ca3af" strokeWidth="2" />
                  
                  {/* Y Axis Labels */}
                  <text x="30" y="25" textAnchor="end" className="text-xs fill-gray-500">100%</text>
                  <text x="30" y="65" textAnchor="end" className="text-xs fill-gray-500">75%</text>
                  <text x="30" y="105" textAnchor="end" className="text-xs fill-gray-500">50%</text>
                  <text x="30" y="145" textAnchor="end" className="text-xs fill-gray-500">25%</text>
                  <text x="30" y="185" textAnchor="end" className="text-xs fill-gray-500">0%</text>
                  
                  {/* Sample Data Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={`50,${180 - (analytics.avgScore * 1.6)} 150,${180 - (analytics.avgScore * 1.6)} 250,${180 - (analytics.avgScore * 1.6)} 350,${180 - (analytics.avgScore * 1.6)} 450,${180 - (analytics.avgScore * 1.6)} 550,${180 - (analytics.avgScore * 1.6)} 650,${180 - (analytics.avgScore * 1.6)} 750,${180 - (analytics.avgScore * 1.6)}`}
                  />
                  
                  {/* Data Points */}
                  <circle cx="50" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="150" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="250" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="350" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="450" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="550" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="650" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                  <circle cx="750" cy={180 - (analytics.avgScore * 1.6)} r="5" fill="#3b82f6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Charts - Time Series Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Score Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-600">0-40%</div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${analytics.total > 0 ? (analytics.poor / analytics.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-600">
                        {analytics.poor}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-600">40-59%</div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${analytics.total > 0 ? (analytics.average / analytics.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-600">
                        {analytics.average}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-600">60-79%</div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${analytics.total > 0 ? (analytics.good / analytics.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-600">
                        {analytics.good}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-600">80-100%</div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${analytics.total > 0 ? (analytics.excellent / analytics.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-600">
                        {analytics.excellent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Test Completion Rate</h3>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${analytics.completionRate}, 100`}
                      transform="rotate(-90 50 50)"
                    />
                    {/* Center text */}
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold fill-gray-900"
                    >
                      {analytics.completionRate}%
                    </text>
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Test Completion Rate</p>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combinedApplicants
                .filter(applicant => getNumericScore(applicant) >= 80)
                .sort((a, b) => getNumericScore(b) - getNumericScore(a))
                .slice(0, 6)
                .map((applicant, index) => (
                  <div key={applicant._id || applicant.id || applicant.email || `top-performer-${index}`} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {(applicant.fullName || 'A').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{applicant.fullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{getNumericScore(applicant).toFixed(1)}%</p>
                      {applicant.rating && (
                        <div className="flex items-center justify-end">
                          <StarRating rating={applicant.rating} maxRating={5} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default ModernAnalyticsDashboard;