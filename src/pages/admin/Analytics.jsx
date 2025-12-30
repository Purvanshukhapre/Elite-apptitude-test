import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';

const Analytics = () => {
  const { applicants, isAdminAuthenticated } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);


  // Helper function to extract numeric score from test data
  const getNumericScore = (applicant) => {
    if (applicant.rating !== undefined && applicant.rating !== null) {
      return (applicant.rating / 5) * 100;
    }
    
    if (applicant.correctAnswer !== undefined && applicant.testData?.totalQuestions) {
      return (applicant.correctAnswer / applicant.testData.totalQuestions) * 100;
    }
    
    const testData = applicant.testData;
    if (!testData) return 0;
    
    if (typeof testData.score === 'string' && testData.score.includes('/')) {
      const [correct, total] = testData.score.split('/').map(Number);
      if (total > 0) {
        return (correct / total) * 100;
      }
    }
    
    if (testData.percentage) {
      return parseFloat(testData.percentage);
    }
    
    if (testData.score && typeof testData.score === 'number') {
      return testData.score;
    }
    
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
        console.error('Error fetching feedback:', error);
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
      const applicantFeedback = feedbackData.find(feedback => 
        feedback.email === applicant.email || feedback.name === applicant.fullName
      );
      
      return {
        ...applicant,
        feedback: applicantFeedback || null,
        testData: applicant.testData || null,
        rating: applicant.rating,
        correctAnswer: applicant.correctAnswer !== undefined 
          ? applicant.correctAnswer 
          : (applicant.testData?.correctAnswers !== undefined 
            ? applicant.testData.correctAnswers 
            : applicant.correctAnswer),
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
    
    const excellent = combinedApplicants.filter(a => getNumericScore(a) >= 80).length;
    const good = combinedApplicants.filter(a => getNumericScore(a) >= 60 && getNumericScore(a) < 80).length;
    const average = combinedApplicants.filter(a => getNumericScore(a) >= 40 && getNumericScore(a) < 60).length;
    const poor = combinedApplicants.filter(a => getNumericScore(a) < 40).length;
    
    const avgScore = withTest > 0
      ? (combinedApplicants.filter(a => a.testData || a.rating !== undefined || a.correctAnswer !== undefined).reduce((sum, a) => sum + getNumericScore(a), 0) / withTest).toFixed(1)
      : 0;
      
    const avgTimeSpent = withTest > 0
      ? Math.round(combinedApplicants.filter(a => a.testData).reduce((sum, a) => sum + (a.testData.timeSpent || 0), 0) / withTest / 60)
      : 0;
    
    const completionRate = total > 0 ? ((withTest / total) * 100).toFixed(1) : 0;
    const feedbackRate = withTest > 0 ? ((withFeedback / withTest) * 100).toFixed(1) : 0;

    // Position stats
    const positionStats = {};
    combinedApplicants.forEach(applicant => {
      const position = applicant.postAppliedFor || applicant.position || 'Unknown';
      if (!positionStats[position]) {
        positionStats[position] = {
          count: 0,
          scores: [],
          avgScore: 0
        };
      }
      positionStats[position].count++;
      positionStats[position].scores.push(getNumericScore(applicant));
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

  // Mock data for charts
  const CHART_DATA = [
    { date: 'Jan', applicants: 12, tests: 8 },
    { date: 'Feb', applicants: 19, tests: 14 },
    { date: 'Mar', applicants: 15, tests: 10 },
    { date: 'Apr', applicants: 22, tests: 18 },
    { date: 'May', applicants: 18, tests: 15 },
    { date: 'Jun', applicants: 25, tests: 20 },
    { date: 'Jul', applicants: 28, tests: 24 },
    { date: 'Aug', applicants: 32, tests: 28 },
    { date: 'Sep', applicants: 27, tests: 22 },
    { date: 'Oct', applicants: 35, tests: 30 },
    { date: 'Nov', applicants: 31, tests: 26 },
    { date: 'Dec', applicants: 38, tests: 34 },
  ];

  // Position performance data
  const positionPerformance = Object.entries(analytics.positionStats)
    .map(([position, data]) => ({
      position,
      count: data.count,
      avgScore: parseFloat(data.avgScore)
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  // Score trend data
  const scoreTrendData = [
    { date: 'Jan', score: 72 },
    { date: 'Feb', score: 78 },
    { date: 'Mar', score: 75 },
    { date: 'Apr', score: 82 },
    { date: 'May', score: 79 },
    { date: 'Jun', score: 85 },
    { date: 'Jul', score: 81 },
    { date: 'Aug', score: 87 },
    { date: 'Sep', score: 84 },
    { date: 'Oct', score: 89 },
    { date: 'Nov', score: 86 },
    { date: 'Dec', score: 91 },
  ];

  return (
      <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.avgScore}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feedback Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.feedbackRate}%</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trends Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Score Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {scoreTrendData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${(item.score / 100) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Completion Donut */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Completion</h3>
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</span>
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    className="stroke-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * analytics.completionRate) / 100}
                    transform="rotate(-90 50 50)"
                    className="stroke-blue-500"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Position Performance and Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Performance</h3>
            <div className="space-y-3">
              {positionPerformance.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{item.position}</h4>
                    <p className="text-xs text-gray-500">{item.count} applicants</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{item.avgScore}%</p>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{width: `${item.avgScore}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {combinedApplicants
                .filter(applicant => getNumericScore(applicant) >= 80)
                .sort((a, b) => getNumericScore(b) - getNumericScore(a))
                .slice(0, 5)
                .map((applicant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {(applicant.fullName || 'A').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{applicant.fullName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{getNumericScore(applicant).toFixed(1)}%</p>
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
        </div>
      </div>
  );
};

export default Analytics;