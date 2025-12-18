import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import AdminLayout from '../components/AdminLayout';
import { sampleQuestions } from '../data/questions';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { applicants, isAdminAuthenticated } = useApp();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  // Start animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        setAnimationProgress(Math.min(progress, 1));
        if (progress >= 1) clearInterval(interval);
      }, 20);
      
      return () => clearInterval(interval);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!applicants || applicants.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        positionStats: {},
        categoryScores: {},
        timeStats: {
          avgTimePerQuestion: 0,
          totalTime: 0
        }
      };
    }

    let passed = 0;
    let totalScore = 0;
    const positionStats = {};
    const categoryScores = {};
    let totalQuestionTime = 0;
    let answeredQuestions = 0;

    applicants.forEach(applicant => {
      if (!applicant.testData) return;
      
      const score = parseFloat(applicant.testData.percentage) || 0;
      totalScore += score;
      
      if (score >= 60) passed++;
      
      const position = applicant.position || 'Unknown';
      if (!positionStats[position]) {
        positionStats[position] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      positionStats[position].count++;
      positionStats[position].totalScore += score;

      // Process answers to calculate category scores
      Object.entries(applicant.testData.answers).forEach(([questionId, answerData]) => {
        const question = sampleQuestions.find(q => q.id === parseInt(questionId));
        if (!question) return;
        
        const category = question.category;
        const isCorrect = answerData.isCorrect ? 1 : 0;
        
        if (!categoryScores[category]) {
          categoryScores[category] = { correct: 0, total: 0, percentage: 0 };
        }
        categoryScores[category].correct += isCorrect;
        categoryScores[category].total += 1;
        
        // Track time spent
        if (answerData.timeSpent) {
          totalQuestionTime += answerData.timeSpent;
          answeredQuestions++;
        }
      });
    });

    // Calculate average scores for each position
    Object.keys(positionStats).forEach(position => {
      const stats = positionStats[position];
      stats.avgScore = Math.round(stats.totalScore / stats.count);
    });

    // Calculate category percentages
    Object.keys(categoryScores).forEach(category => {
      const stats = categoryScores[category];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return {
      total: applicants.length,
      passed,
      failed: applicants.length - passed,
      averageScore: Math.round(totalScore / applicants.filter(a => a.testData).length || 1),
      positionStats,
      categoryScores,
      timeStats: {
        avgTimePerQuestion: answeredQuestions > 0 ? Math.round(totalQuestionTime / answeredQuestions) : 0,
        totalTime: totalQuestionTime
      }
    };
  }, [applicants]);

  // Generate chart data for different metrics
  const generateChartData = (metric, title, description, color, xAxis = 'date', yAxis = 'value') => {
    if (!applicants || applicants.length === 0) {
      return {
        data: [],
        minValue: 0,
        maxValue: 100,
        title,
        description,
        color,
        xAxis,
        yAxis
      };
    }

    // Filter applicants with test data
    const testDataAvailable = applicants.filter(a => a.testData);
    if (testDataAvailable.length === 0) {
      return {
        data: [],
        minValue: 0,
        maxValue: 100,
        title,
        description,
        color,
        xAxis,
        yAxis
      };
    }

    let data = [];
    
    switch(metric) {
      case 'performance':
        // Last 10 applicants by submission date
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.percentage) || 0
        }));
        break;
        
      case 'accuracy':
        // Last 10 applicants by submission date
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.accuracy) || 0
        }));
        break;
        
      case 'speed':
        // Last 10 applicants by submission date
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.timeTaken) || 0
        }));
        break;
        
      case 'categories':
        // Category performance
        data = Object.entries(analytics.categoryScores).map(([category, stats]) => ({
          [xAxis]: category,
          [yAxis]: stats.percentage
        }));
        break;
        
      default:
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.percentage) || 0
        }));
    }

    const values = data.map(d => d[yAxis]);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 100);

    return {
      data,
      minValue,
      maxValue: maxValue === minValue ? maxValue + 10 : maxValue,
      title,
      description,
      color,
      xAxis,
      yAxis
    };
  };

  // Chart components
  const AnimatedLineChart = ({ data, title, description, color, xAxis = 'x', yAxis = 'y', minValue = 0, maxValue = 100 }) => {
    const generateAnimatedPath = () => {
      if (!data || data.length === 0) return "";
      
      let pathData = [];
      
      data.forEach((d, i) => {
        const x = data.length === 1 ? 200 : 40 + (i * (320 / (data.length - 1)));
        const y = 170 - ((d[yAxis] - minValue) / (maxValue - minValue)) * 160;
        pathData.push(`${x} ${y}`);
      });
      
      if (pathData.length === 0) return "";
      return `M ${pathData.join(' L ')}`;
    };
    
    const generateAreaPath = () => {
      if (!data || data.length === 0) return "";
      
      let pathData = [];
      let lastX = 0;
      
      data.forEach((d, i) => {
        const x = data.length === 1 ? 200 : 40 + (i * (320 / (data.length - 1)));
        const y = 170 - ((d[yAxis] - minValue) / (maxValue - minValue)) * 160;
        pathData.push(`${x} ${y}`);
      });
      
      if (pathData.length === 0) return "";
      return `M 40 170 L ${pathData.join(' L ')} L ${lastX} 170 Z`;
    };
    
    const getDataPointCoords = (d, i) => {
      if (data.length === 1) {
        return {
          x: 200,
          y: 170 - ((d[yAxis] - minValue) / (maxValue - minValue)) * 160
        };
      }
      
      const x = 40 + (i * (320 / (data.length - 1)));
      const y = 170 - ((d[yAxis] - minValue) / (maxValue - minValue)) * 160;
      return { x, y };
    };
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80 relative group overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`line-gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line 
                  key={i}
                  x1="0" 
                  y1={i * 40} 
                  x2="400" 
                  y2={i * 40} 
                  stroke="#E5E7EB" 
                  strokeWidth="0.5" 
                />
              ))}
              
              {/* Y-axis labels */}
              <text x="10" y="10" fontSize="10" fill="#6B7280">{maxValue.toFixed(1)}{yAxis.includes('Score') ? '%' : yAxis.includes('Time') ? ' min' : ''}</text>
              <text x="10" y="50" fontSize="10" fill="#6B7280">{(maxValue * 0.75).toFixed(1)}{yAxis.includes('Score') ? '%' : yAxis.includes('Time') ? ' min' : ''}</text>
              <text x="10" y="90" fontSize="10" fill="#6B7280">{(maxValue * 0.5).toFixed(1)}{yAxis.includes('Score') ? '%' : yAxis.includes('Time') ? ' min' : ''}</text>
              <text x="10" y="130" fontSize="10" fill="#6B7280">{(maxValue * 0.25).toFixed(1)}{yAxis.includes('Score') ? '%' : yAxis.includes('Time') ? ' min' : ''}</text>
              <text x="10" y="170" fontSize="10" fill="#6B7280">{minValue.toFixed(1)}{yAxis.includes('Score') ? '%' : yAxis.includes('Time') ? ' min' : ''}</text>
              
              {/* Animated Line chart */}
              <path 
                d={generateAnimatedPath()}
                fill="none" 
                stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Animated Area under line */}
              <path 
                d={generateAreaPath()}
                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Data points */}
              {data.map((d, i) => {
                const coords = getDataPointCoords(d, i);
                const isVisible = i < Math.max(1, Math.floor(data.length * animationProgress));
                
                if (!isVisible) return null;
                
                return (
                  <g key={i}>
                    <circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r="6" 
                      fill={color} 
                      stroke="#fff" 
                      strokeWidth="2" 
                      onMouseEnter={() => setHoveredPoint({ index: i, data: d, coords })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer transition-all duration-200 hover:r-8"
                    />
                    
                    {/* Tooltip */}
                    {hoveredPoint && hoveredPoint.index === i && (
                      <g>
                        <rect 
                          x={coords.x - 35} 
                          y={coords.y - 40} 
                          width="70" 
                          height="30" 
                          rx="6" 
                          fill="#1F2937" 
                        />
                        <text 
                          x={coords.x} 
                          y={coords.y - 25} 
                          textAnchor="middle" 
                          fill="white" 
                          fontSize="11" 
                          fontWeight="bold"
                        >
                          {d[yAxis].toFixed(1)}{yAxis.includes('Score') ? '%' : ''}
                        </text>
                        <text 
                          x={coords.x} 
                          y={coords.y - 12} 
                          textAnchor="middle" 
                          fill="white" 
                          fontSize="9"
                        >
                          {(d[xAxis] || '').toString().substring(0, 8)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              
              {/* X-axis labels */}
              {data.map((d, i) => {
                let x;
                if (data.length === 1) {
                  x = 200; // Center position for single data point
                } else {
                  x = 40 + (i * (320 / (data.length - 1)));
                }
                
                const isVisible = i < Math.max(1, Math.floor(data.length * animationProgress));
                if (!isVisible) return null;
                
                return (
                  <text 
                    key={i}
                    x={x} 
                    y="190" 
                    fontSize="10" 
                    fill="#6B7280" 
                    textAnchor="middle"
                  >
                    {(d[xAxis] || '').toString().substring(0, 5)}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Explanation component
  const ChartExplanation = ({ title, explanation }) => (
    <div className="bg-gray-50 rounded-xl p-4 mt-4">
      <h4 className="font-bold text-gray-900 text-sm mb-2">Insight: {title}</h4>
      <p className="text-xs text-gray-600">{explanation}</p>
    </div>
  );

  // Generate chart data
  const performanceData = generateChartData(
    'performance',
    'Student Performance Overview',
    'Overall test scores across recent applicants',
    '#3B82F6',
    'applicant',
    'Score (%)'
  );

  const accuracyData = generateChartData(
    'accuracy',
    'Accuracy Analysis',
    'Correct answers vs total questions',
    '#10B981',
    'applicant',
    'Accuracy (%)'
  );

  const speedData = generateChartData(
    'speed',
    'Response Time Analysis',
    'Average time taken per question',
    '#8B5CF6',
    'applicant',
    'Time (sec)'
  );

  const categoryData = generateChartData(
    'categories',
    'Category-wise Performance',
    'Performance breakdown by question categories',
    '#F59E0B',
    'category',
    'Score (%)'
  );

  return (
    <AdminLayout activeTab="analytics">
      {/* Main Content */}
      <div className="p-6 mx-auto">
        {/* Summary Cards - Clean visual hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Applicants</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{applicants.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Tests Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {applicants.filter(a => a.testData).length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Avg Accuracy</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {analytics.averageScore}%
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Avg Time/Q</p>
                <p className="text-2xl font-bold text-amber-900 mt-2">
                  {analytics.timeStats.avgTimePerQuestion}s
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Grid - Polished containers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <AnimatedLineChart {...performanceData} />
          <AnimatedLineChart {...accuracyData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <AnimatedLineChart {...speedData} />
          <AnimatedLineChart {...categoryData} />
        </div>
        
        {/* Insights Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-gray-900">Overall Performance</h4>
              <p className="text-sm text-gray-600 mt-2">
                The average test score is {analytics.averageScore}%, indicating {' '}
                {analytics.averageScore >= 70 ? 'strong' : analytics.averageScore >= 50 ? 'moderate' : 'weak'}{' '}
                candidate performance across all positions.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-gray-900">Category Analysis</h4>
              <p className="text-sm text-gray-600 mt-2">
                {Object.keys(analytics.categoryScores).length > 0 ? (
                  <>
                    Top performing category: <span className="font-semibold">
                      {Object.entries(analytics.categoryScores)
                        .sort(([,a], [,b]) => b.percentage - a.percentage)[0][0]}
                    </span>
                  </>
                ) : 'No category data available'}
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold text-gray-900">Time Efficiency</h4>
              <p className="text-sm text-gray-600 mt-2">
                Average time per question is {analytics.timeStats.avgTimePerQuestion} seconds, suggesting {' '}
                {analytics.timeStats.avgTimePerQuestion <= 30 ? 'efficient' : 'careful'}{' '}
                response patterns among candidates.
              </p>
            </div>
          </div>
        </div>
        
        {/* Position-wise Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Position-wise Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(analytics.positionStats).length > 0 ? (
                  Object.entries(analytics.positionStats).map(([position, stats]) => (
                    <tr key={position} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-900">{position}</td>
                      <td className="py-4 text-sm text-gray-500">{stats.count}</td>
                      <td className="py-4 text-sm text-gray-900">
                        <span className="font-bold">{stats.avgScore}%</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.round((stats.count > 0 ? stats.count / applicants.length : 0) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((stats.count > 0 ? stats.count / applicants.length : 0) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No position data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;