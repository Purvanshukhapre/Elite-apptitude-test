import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const Analytics = () => {
  const { applicants, isAdminAuthenticated } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'week', 'month', 'year', 'all'

  // Helper function to extract numeric score from test data
  const getNumericScore = (applicant) => {
    // Use test result data if available, prioritize over feedback
    if (applicant.correctAnswer !== undefined && applicant.testData?.totalQuestions) {
      return (applicant.correctAnswer / applicant.testData.totalQuestions) * 100;
    }
    
    const testData = applicant.testData;
    if (testData) {
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
    }
    
    // Only use feedback ratings if no test data is available
    if (applicant.rating !== undefined && applicant.rating !== null) {
      return (applicant.rating / 5) * 100;
    }
    
    return 0;
  };

  // Helper function to get submission date
  const getSubmissionDate = (applicant) => {
    return new Date(
      applicant.submittedAt || 
      applicant.createdAt || 
      applicant.updatedAt || 
      applicant.date || 
      Date.now()
    );
  };

  // Filter applicants based on time filter
  const filteredApplicants = useMemo(() => {
    if (!applicants || timeFilter === 'all') return applicants;
    
    const now = new Date();
    let cutoffDate = new Date(now);
    
    switch (timeFilter) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return applicants;
    }
    
    return applicants.filter(applicant => {
      const submissionDate = getSubmissionDate(applicant);
      return submissionDate >= cutoffDate;
    });
  }, [applicants, timeFilter]);

  // Fetch feedback data on component mount
  useEffect(() => {
    if (isAdminAuthenticated) {
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
      
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [isAdminAuthenticated]);

  // Combine filtered applicants with feedback data
  const combinedApplicants = useMemo(() => {
    return filteredApplicants.map(applicant => {
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
  }, [filteredApplicants, feedbackData]);

  // Analytics data
  const analytics = useMemo(() => {
    const total = combinedApplicants.length;
    const withTest = combinedApplicants.filter(a => a.testData || a.correctAnswer !== undefined).length;
    const withFeedback = combinedApplicants.filter(a => a.feedback).length;
    const pending = total - withTest;
    
    const excellent = combinedApplicants.filter(a => getNumericScore(a) >= 90).length;
    const veryGood = combinedApplicants.filter(a => getNumericScore(a) >= 80 && getNumericScore(a) < 90).length;
    const good = combinedApplicants.filter(a => getNumericScore(a) >= 70 && getNumericScore(a) < 80).length;
    const average = combinedApplicants.filter(a => getNumericScore(a) >= 60 && getNumericScore(a) < 70).length;
    const belowAverage = combinedApplicants.filter(a => getNumericScore(a) >= 50 && getNumericScore(a) < 60).length;
    const poor = combinedApplicants.filter(a => getNumericScore(a) < 50).length;
    
    const avgScore = withTest > 0
      ? (combinedApplicants.filter(a => a.testData || a.correctAnswer !== undefined).reduce((sum, a) => sum + getNumericScore(a), 0) / withTest).toFixed(1)
      : 0;
      
    const avgTimeSpent = withTest > 0
      ? Math.round(combinedApplicants.filter(a => a.testData).reduce((sum, a) => sum + (a.testData?.timeSpent || 0), 0) / withTest / 60)
      : 0;
    
    const completionRate = total > 0 ? ((withTest / total) * 100).toFixed(1) : 0;
    const feedbackRate = withTest > 0 ? ((withFeedback / withTest) * 100).toFixed(1) : 0;

    // Position stats - only include applicants with test scores
    const positionStats = {};
    combinedApplicants.forEach(applicant => {
      const position = applicant.postAppliedFor || applicant.position || 'Unknown';
      const applicantScore = getNumericScore(applicant);
      // Only include applicants with actual test scores (not just feedback ratings)
      if (applicant.testData || applicant.correctAnswer !== undefined) {
        if (!positionStats[position]) {
          positionStats[position] = {
            count: 0,
            scores: [],
            avgScore: 0
          };
        }
        positionStats[position].count++;
        positionStats[position].scores.push(applicantScore);
      }
    });

    Object.keys(positionStats).forEach(pos => {
      const scores = positionStats[pos].scores;
      positionStats[pos].avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

    // Count total applicants per position (not just those with test scores)
    const positionApplicantCount = {};
    combinedApplicants.forEach(applicant => {
      const position = applicant.postAppliedFor || applicant.position || 'Unknown';
      if (!positionApplicantCount[position]) {
        positionApplicantCount[position] = 0;
      }
      positionApplicantCount[position]++;
    });

    return {
      total,
      withTest,
      withFeedback,
      pending,
      excellent,
      veryGood,
      good,
      average,
      belowAverage,
      poor,
      avgScore,
      avgTimeSpent,
      completionRate,
      feedbackRate,
      positionStats,
      positionApplicantCount
    };
  }, [combinedApplicants]);

  // Grade distribution data
  const gradeDistribution = {
    'A+': {
      grade: 'A+',
      minScore: 90,
      maxScore: 100,
      applicants: combinedApplicants.filter(a => getNumericScore(a) >= 90),
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    'A': {
      grade: 'A',
      minScore: 80,
      maxScore: 89,
      applicants: combinedApplicants.filter(a => getNumericScore(a) >= 80 && getNumericScore(a) < 90),
      color: 'bg-green-400',
      textColor: 'text-green-400'
    },
    'B': {
      grade: 'B',
      minScore: 70,
      maxScore: 79,
      applicants: combinedApplicants.filter(a => getNumericScore(a) >= 70 && getNumericScore(a) < 80),
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    'C': {
      grade: 'C',
      minScore: 60,
      maxScore: 69,
      applicants: combinedApplicants.filter(a => getNumericScore(a) >= 60 && getNumericScore(a) < 70),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    'D': {
      grade: 'D',
      minScore: 50,
      maxScore: 59,
      applicants: combinedApplicants.filter(a => getNumericScore(a) >= 50 && getNumericScore(a) < 60),
      color: 'bg-orange-500',
      textColor: 'text-orange-500'
    },
    'F': {
      grade: 'F',
      minScore: 0,
      maxScore: 49,
      applicants: combinedApplicants.filter(a => getNumericScore(a) < 50),
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  };

  // Position performance data
  const positionPerformance = Object.entries(analytics.positionStats)
    .map(([position, data]) => ({
      position,
      count: data.count,
      avgScore: parseFloat(data.avgScore)
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  // Position applicant count data
  const positionApplicantCount = Object.entries(analytics.positionApplicantCount)
    .map(([position, count]) => ({
      position,
      count
    }))
    .sort((a, b) => b.count - a.count);

  // Combined data for the chart (top 8 positions by applicant count)
  const chartData = positionApplicantCount
    .slice(0, 8)
    .map(item => {
      const perf = positionPerformance.find(p => p.position === item.position);
      return {
        position: item.position,
        applicants: item.count,
        avgScore: perf ? perf.avgScore : 0
      };
    });

  // Time-based data for the time series chart
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    const periods = {};
    
    // Initialize data based on the selected time filter
    if (timeFilter === 'week') {
      // For week view, create daily data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        periods[dayKey] = {
          period: dayKey,
          applicants: 0,
          avgScore: 0,
          totalScore: 0,
          scoreCount: 0,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()) // Store date for comparison
        };
      }
    } else if (timeFilter === 'month') {
      // For month view, create daily data for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        periods[dayKey] = {
          period: dayKey,
          applicants: 0,
          avgScore: 0,
          totalScore: 0,
          scoreCount: 0,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()) // Store date for comparison
        };
      }
    } else if (timeFilter === 'year') {
      // For year view, create monthly data for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        periods[monthKey] = {
          period: monthKey,
          applicants: 0,
          avgScore: 0,
          totalScore: 0,
          scoreCount: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1) // Store date for comparison
        };
      }
    } else {
      // For 'all' view, create monthly data
      // Find the earliest date in the data
      let earliestDate = now;
      combinedApplicants.forEach(applicant => {
        const submissionDate = getSubmissionDate(applicant);
        if (submissionDate < earliestDate) {
          earliestDate = submissionDate;
        }
      });
      
      // Create monthly data from the earliest date to now
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
      const startDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
      
      for (let date = new Date(startDate); date < endDate; date.setMonth(date.getMonth() + 1)) {
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        periods[monthKey] = {
          period: monthKey,
          applicants: 0,
          avgScore: 0,
          totalScore: 0,
          scoreCount: 0,
          date: new Date(date.getFullYear(), date.getMonth(), 1) // Store date for comparison
        };
      }
    }

    // Process applicants to aggregate data based on the selected time filter
    combinedApplicants.forEach(applicant => {
      const submissionDate = getSubmissionDate(applicant);
      
      let periodKey;
      if (timeFilter === 'week') {
        // Group by day for week view
        const dayDate = new Date(submissionDate.getFullYear(), submissionDate.getMonth(), submissionDate.getDate());
        periodKey = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (timeFilter === 'month') {
        // Group by day for month view
        const dayDate = new Date(submissionDate.getFullYear(), submissionDate.getMonth(), submissionDate.getDate());
        periodKey = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        // Group by month for year and all views
        const monthDate = new Date(submissionDate.getFullYear(), submissionDate.getMonth(), 1);
        periodKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (periods[periodKey]) {
        periods[periodKey].applicants += 1;
        const score = getNumericScore(applicant);
        if (score > 0) {
          periods[periodKey].totalScore += score;
          periods[periodKey].scoreCount += 1;
        }
      }
    });

    // Calculate average scores for each period
    Object.values(periods).forEach(period => {
      if (period.scoreCount > 0) {
        period.avgScore = parseFloat((period.totalScore / period.scoreCount).toFixed(1));
      }
    });

    // Sort periods by date
    return Object.values(periods).sort((a, b) => a.date - b.date);
  }, [combinedApplicants, timeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title and Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into applicant performance and engagement</p>
        </div>
        <div className="flex space-x-2">
          {['week', 'month', 'year', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview - Modern gradient cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Applicants</p>
              <p className="text-3xl font-bold">{analytics.total}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Avg. Score</p>
              <p className="text-3xl font-bold">{analytics.avgScore}%</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Completion Rate</p>
              <p className="text-3xl font-bold">{analytics.completionRate}%</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Feedback Rate</p>
              <p className="text-3xl font-bold">{analytics.feedbackRate}%</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Time Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Trend Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timeSeriesData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={timeFilter === 'week' || timeFilter === 'month' ? -45 : 0}
                textAnchor={timeFilter === 'week' || timeFilter === 'month' ? 'end' : 'middle'}
                height={timeFilter === 'week' || timeFilter === 'month' ? 60 : 40}
              />
              <YAxis 
                yAxisId="left"
                domain={[0, Math.max(100, Math.max(...timeSeriesData.map(d => d.avgScore))) * 1.2]} 
                tickCount={6}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, Math.max(1, Math.max(...timeSeriesData.map(d => d.applicants))) * 1.2]}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'avgScore') return [`${value}%`, 'Average Score'];
                  if (name === 'applicants') return [value, 'Applicants'];
                  return [value, name];
                }}
                labelFormatter={(label) => `${timeFilter === 'week' || timeFilter === 'month' ? 'Day' : 'Month'}: ${label}`}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              {(timeFilter === 'week' || timeFilter === 'month') ? (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Average Score"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ) : (
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Average Score"
                />
              )}
              <Bar 
                yAxisId="right"
                dataKey="applicants" 
                fill="#8B5CF6" 
                fillOpacity={0.6}
                name="Applicants"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Distribution Card - Full Width */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Grade Distribution</h3>
        
        {/* Grade Circles */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {Object.entries(gradeDistribution).map(([gradeKey, gradeData]) => (
            <div key={gradeKey} className="flex flex-col items-center">
              <div className={`${gradeData.color} w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3`}>
                {gradeData.grade}
              </div>
              <div className="text-center">
                <p className={`font-semibold ${gradeData.textColor}`}>{gradeData.minScore}-{gradeData.maxScore}%</p>
                <p className="text-gray-600 text-sm">{gradeData.applicants.length} applicants</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grade Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(gradeDistribution).map(([gradeKey, gradeData]) => (
            <div key={gradeKey} className="border border-gray-200 rounded-xl p-6">
              <h4 className={`text-xl font-bold mb-4 flex items-center ${gradeData.textColor}`}>
                <span className={`${gradeData.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                  {gradeData.grade}
                </span>
                {gradeData.grade} Grade ({gradeData.minScore}-{gradeData.maxScore}%)
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {gradeData.applicants
                  .sort((a, b) => getNumericScore(b) - getNumericScore(a))
                  .map((applicant, index) => (
                    <div key={`${applicant._id || applicant.id || index}-${gradeKey}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{applicant.fullName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500 truncate">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">{getNumericScore(applicant).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                {gradeData.applicants.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No applicants in this grade</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Positions Performance - Graph and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Positions Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 80,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="position" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 100]} 
                  tickCount={6}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, Math.max(...chartData.map(d => d.applicants)) * 1.2]}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'avgScore') return [`${value}%`, 'Average Score'];
                    if (name === 'applicants') return [value, 'Applicants'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Position: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="right"
                  dataKey="applicants" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                  name="Applicants"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Average Score"
                  dot={{ r: 5, fill: '#10B981' }}
                  activeDot={{ r: 8, fill: '#10B981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Position Applicant Count</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {positionApplicantCount.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                    'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{item.count}</p>
                  <p className="text-sm text-gray-500">Applicants</p>
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