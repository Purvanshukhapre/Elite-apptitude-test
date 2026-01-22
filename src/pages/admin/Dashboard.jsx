import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { useAdminData } from '../../hooks/useAdminData';
import { getNumericScore, extractDate } from '../../utils/helpers';
import StarRating from '../../components/shared/StarRating';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { applicants, refreshApplicants } = useApp();
  const { fetchFeedback } = useAdminData();
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch feedback data and refresh applicants on component mount
  useEffect(() => {
    let isCancelled = false; // Prevent state updates if component unmounts
    
    const fetchData = async () => {
      // Remove authentication check - attempt to fetch data regardless of auth status
      if (isCancelled) {
        return;
      }
      
      setLoading(true);
      try {
        // Refresh applicants data from API
        await refreshApplicants();
        
        // Fetch feedback data
        const data = await fetchFeedback();
        if (!isCancelled) {
          setFeedbackData(data);
        }
      } catch (error) {
        console.error('Error in dashboard data fetch:', error);
        if (!isCancelled) {
          setFeedbackData([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    
    // Cleanup function to cancel requests if component unmounts
    return () => {
      isCancelled = true;
    };
  }, []); // Run once on mount

  // Combine applicants with feedback data
  const combinedApplicants = useMemo(() => {
    return applicants.map(applicant => {
      const applicantFeedback = feedbackData.find(feedback => 
        feedback.email === applicant.email || 
        feedback.name === applicant.fullName ||
        feedback.fullName === applicant.fullName
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
    const withTest = combinedApplicants.filter(a => 
      a.testData || a.correctAnswer !== undefined || a.rating !== undefined
    ).length;
    const withFeedback = combinedApplicants.filter(a => a.feedback).length;
    const pending = total - withTest;
    
    const scores = combinedApplicants
      .filter(a => a.testData || a.correctAnswer !== undefined || a.rating !== undefined)
      .map(a => getNumericScore(a));
    
    const excellent = combinedApplicants.filter(a => getNumericScore(a) >= 90).length;
    const good = combinedApplicants.filter(a => getNumericScore(a) >= 80 && getNumericScore(a) < 90).length;
    const average = combinedApplicants.filter(a => getNumericScore(a) >= 70 && getNumericScore(a) < 80).length;
    const poor = combinedApplicants.filter(a => getNumericScore(a) < 70).length;
    
    const avgScore = scores.length > 0
      ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
      : 0;
      
    const avgTimeSpent = withTest > 0
      ? Math.round(combinedApplicants
          .filter(a => a.testData?.timeSpent)
          .reduce((sum, a) => sum + (a.testData.timeSpent || 0), 0) / withTest / 60)
      : 0;
    
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
      feedbackRate,
      scores
    };
  }, [combinedApplicants]);

  // Generate time-based chart data (last 7 days)
  const timeBasedData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create a date string with leading zeros for consistent comparison
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDateStr = `${year}-${month}-${day}`;
      
      const dayApplicants = combinedApplicants.filter(app => {
        const appDate = extractDate(app);
        if (!appDate) return false;
        
        // Handle different date formats
        let appDateStr;
        if (typeof appDate === 'string') {
          try {
            // Try to parse the date string
            const parsedDate = new Date(appDate);
            appDateStr = parsedDate.toISOString().split('T')[0];
          } catch {
            return false;
          }
        } else if (appDate instanceof Date) {
          appDateStr = appDate.toISOString().split('T')[0];
        } else {
          return false;
        }
        
        return appDateStr === formattedDateStr;
      });
      
      const dayTests = combinedApplicants.filter(app => {
        // Try to get date from various fields, prioritizing testData dates
        const dateValue = app.testData?.submittedAt || app.submittedAt || app.createdAt || app.date || app.timestamp || app.updatedAt || app.testCompletedAt || app.feedbackSubmittedAt || app.created_at || app.updated_at || app.date_created || app.date_updated || app.submitted_at || app.created || app.created_date || app.updated || app.dateSubmitted || app.submissionDate || app.applicationDate;
        let testDate;
        if (dateValue) {
          testDate = dateValue;
        } else if (app._id) {
          try {
            const timestamp = parseInt(app._id.substring(0, 8), 16) * 1000;
            testDate = new Date(timestamp);
          } catch {
            testDate = null;
          }
        } else {
          testDate = null;
        }
        
        if (!testDate) return false;
        
        // Handle different date formats
        let testDateStr;
        if (typeof testDate === 'string') {
          try {
            // Try to parse the date string
            const parsedDate = new Date(testDate);
            testDateStr = parsedDate.toISOString().split('T')[0];
          } catch {
            return false;
          }
        } else if (testDate instanceof Date) {
          testDateStr = testDate.toISOString().split('T')[0];
        } else {
          return false;
        }
        
        return testDateStr === formattedDateStr;
      });
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        fullDate: formattedDateStr,
        applicants: dayApplicants.length,
        tests: dayTests.length,
        avgScore: dayTests.length > 0
          ? (dayTests.reduce((sum, app) => sum + getNumericScore(app), 0) / dayTests.length).toFixed(1)
          : 0
      });
    }
    
    return days;
  }, [combinedApplicants]);

  // Score distribution data
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: 'A+ (90-100%)', min: 90, max: 100, color: '#10B981' },
      { name: 'A (80-89%)', min: 80, max: 89, color: '#3B82F6' },
      { name: 'B (70-79%)', min: 70, max: 79, color: '#8B5CF6' },
      { name: 'C (60-69%)', min: 60, max: 69, color: '#F59E0B' },
      { name: 'Below C (<60%)', min: 0, max: 59, color: '#EF4444' }
    ];
    
    return ranges.map(range => {
      const count = analytics.scores.filter(score => 
        score >= range.min && score <= range.max
      ).length;
      
      return {
        ...range,
        value: count,
        percentage: analytics.withTest > 0 ? ((count / analytics.withTest) * 100).toFixed(1) : 0
      };
    });
  }, [analytics]);

  // Performance by position
  const positionPerformance = useMemo(() => {
    const positionMap = {};
    combinedApplicants.forEach(applicant => {
      const position = applicant.postAppliedFor || applicant.position || 'Unknown';
      if (!positionMap[position]) {
        positionMap[position] = {
          count: 0,
          scores: [],
          avgScore: 0
        };
      }
      positionMap[position].count++;
      const score = getNumericScore(applicant);
      if (score > 0) {
        positionMap[position].scores.push(score);
      }
    });

    Object.keys(positionMap).forEach(pos => {
      const scores = positionMap[pos].scores;
      positionMap[pos].avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

    return Object.entries(positionMap)
      .map(([position, data]) => ({
        position,
        count: data.count,
        avgScore: parseFloat(data.avgScore),
        completed: data.scores.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }, [combinedApplicants]);

  // Recent applicants
  const recentApplicants = useMemo(() => {
    return [...combinedApplicants]
      .sort((a, b) => {
        const dateA = extractDate(a);
        const dateB = extractDate(b);
        if (!dateA || !dateB) return 0;
        
        // Convert to Date objects if they're strings
        const dateObjA = typeof dateA === 'string' ? new Date(dateA) : dateA;
        const dateObjB = typeof dateB === 'string' ? new Date(dateB) : dateB;
        
        return dateObjB - dateObjA;
      })
      .slice(0, 5);
  }, [combinedApplicants]);

  // Top performers
  const topPerformers = useMemo(() => {
    return [...combinedApplicants]
      .filter(a => getNumericScore(a) > 0)
      .sort((a, b) => getNumericScore(b) - getNumericScore(a))
      .slice(0, 5);
  }, [combinedApplicants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your applicants.</p>
        </div>
        <button
          onClick={() => navigate('/admin/modern/applicants')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          View All Applicants
        </button>
      </div>

      {/* Stat Cards - Enhanced with gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applicants */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Applicants</p>
              <p className="text-4xl font-bold">{analytics.total}</p>
              <p className="text-blue-100 text-xs mt-2">
                {analytics.pending} pending tests
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tests Completed */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Tests Completed</p>
              <p className="text-4xl font-bold">{analytics.withTest}</p>
              <p className="text-green-100 text-xs mt-2">
                {analytics.completionRate}% completion rate
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Average Score</p>
              <p className="text-4xl font-bold">{analytics.avgScore}%</p>
              <p className="text-purple-100 text-xs mt-2">
                {analytics.excellent + analytics.good} high performers
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Feedback Rate */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Feedback Rate</p>
              <p className="text-4xl font-bold">{analytics.feedbackRate}%</p>
              <p className="text-orange-100 text-xs mt-2">
                {analytics.withFeedback} responses
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-500">Applications and test completions</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeBasedData}>
              <defs>
                <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="applicants" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorApplicants)"
                name="Applications"
              />
              <Area 
                type="monotone" 
                dataKey="tests" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorTests)"
                name="Tests Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Score Distribution</h3>
              <p className="text-sm text-gray-500">Performance breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics and Position Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">A+ (90-100%)</p>
                  <p className="text-sm text-gray-500">{analytics.excellent} applicants</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{analytics.excellent}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">A (80-89%)</p>
                  <p className="text-sm text-gray-500">{analytics.good} applicants</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{analytics.good}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">B (70-79%)</p>
                  <p className="text-sm text-gray-500">{analytics.average} applicants</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{analytics.average}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Below B (&lt;70%)</p>
                  <p className="text-sm text-gray-500">{analytics.poor} applicants</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">{analytics.poor}</span>
            </div>
          </div>
        </div>

        {/* Position Performance */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Positions</h3>
            <button 
              onClick={() => navigate('/admin/modern/analytics')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {positionPerformance.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No position data available</p>
              </div>
            ) : (
              positionPerformance.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{item.position}</h4>
                    <span className="text-lg font-bold text-blue-600">{item.avgScore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>{item.count} applicants</span>
                    <span>{item.completed} completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.avgScore, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Performers</h3>
            <button 
              onClick={() => navigate('/admin/modern/applicants')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topPerformers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No performance data available</p>
              </div>
            ) : (
              topPerformers.map((applicant, index) => {
                const score = getNumericScore(applicant);
                return (
                  <div 
                    key={applicant._id || applicant.id || index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                    onClick={() => {
                      const applicantId = applicant._id || applicant.id || applicant.fullName || applicant.name || index;
                      navigate(`/admin/modern/applicants/${encodeURIComponent(applicantId)}`);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {(applicant.fullName || applicant.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{applicant.fullName || applicant.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{applicant.postAppliedFor || applicant.position || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{score.toFixed(1)}%</p>
                      {applicant.rating && (
                        <div className="flex items-center justify-end mt-1">
                          <StarRating rating={applicant.rating} maxRating={5} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Applications</h3>
            <p className="text-sm text-gray-500">Latest applicant activity</p>
          </div>
          <button 
            onClick={() => navigate('/admin/modern/applicants')}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Applicant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Position</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rating</th>
              </tr>
            </thead>
            <tbody>
              {recentApplicants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No recent applicants
                  </td>
                </tr>
              ) : (
                recentApplicants.map((applicant, index) => {
                  const score = getNumericScore(applicant);
                  const hasTest = applicant.testData || applicant.correctAnswer !== undefined;
                  const status = hasTest ? 'Completed' : 'Pending';

                  return (
                    <tr 
                      key={applicant._id || applicant.id || index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        const applicantId = applicant._id || applicant.id || applicant.fullName || applicant.name || index;
                        navigate(`/admin/modern/applicants/${encodeURIComponent(applicantId)}`);
                      }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium">
                            {(applicant.fullName || applicant.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{applicant.fullName || applicant.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{applicant.permanentEmail || applicant.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{applicant.postAppliedFor || applicant.position || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === 'Completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {hasTest ? (
                          <span className="text-lg font-bold text-blue-600">{score.toFixed(1)}%</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {applicant.rating ? (
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-lg ${i < applicant.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No rating</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
