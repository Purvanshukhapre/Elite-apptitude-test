import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import AdminLayout from '../components/AdminLayout';
// To use the API, import the functions from '../api'
// Example: import { getAnalyticsDashboard } from '../api';

const PremiumDashboard = () => {
  const navigate = useNavigate();
  const { applicants, isAdminAuthenticated } = useApp();
  const chartContainerRef = useRef(null);
  
  const [chartView, setChartView] = useState('daily');
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('applicants');
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

  // Generate animated path for the chart
  const generateAnimatedPath = () => {
    if (!applicants || applicants.length === 0) return "";
    
    const dataPoints = applicants.slice(-7).map((applicant, index) => ({
      value: applicant.testData?.percentage || applicant.testData?.overallPercentage || 0,
      label: `Day ${index + 1}`
    }));
    
    if (dataPoints.length === 0) return "";
    
    let path = `M 0 ${100 - (dataPoints[0].value * 0.9)} `;
    
    for (let i = 1; i < dataPoints.length; i++) {
      const x = (i / (dataPoints.length - 1)) * 100;
      const y = 100 - (dataPoints[i].value * 0.9);
      path += `L ${x} ${y} `;
    }
    
    return path;
  };

  // Generate area path for the chart
  const generateAreaPath = () => {
    if (!applicants || applicants.length === 0) return "";
    
    const dataPoints = applicants.slice(-7).map((applicant, index) => ({
      value: applicant.testData?.percentage || applicant.testData?.overallPercentage || 0,
      label: `Day ${index + 1}`
    }));
    
    if (dataPoints.length === 0) return "";
    
    let path = `M 0 ${100 - (dataPoints[0].value * 0.9)} `;
    
    for (let i = 1; i < dataPoints.length; i++) {
      const x = (i / (dataPoints.length - 1)) * 100;
      const y = 100 - (dataPoints[i].value * 0.9);
      path += `L ${x} ${y} `;
    }
    
    // Close the area path
    path += `L 100 100 L 0 100 Z`;
    
    return path;
  };

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!applicants || applicants.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        positionStats: {}
      };
    }

    let passed = 0;
    let totalScore = 0;
    const positionStats = {};

    applicants.forEach(applicant => {
      const score = applicant.testData?.percentage || applicant.testData?.overallPercentage || 0;
      totalScore += score;
      
      if (score >= 60) passed++;
      
      const position = applicant.position || 'Unknown';
      if (!positionStats[position]) {
        positionStats[position] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      positionStats[position].count++;
      positionStats[position].totalScore += score;
    });

    // Calculate average scores for each position
    Object.keys(positionStats).forEach(position => {
      const stats = positionStats[position];
      stats.avgScore = Math.round(stats.totalScore / stats.count);
    });

    return {
      total: applicants.length,
      passed,
      failed: applicants.length - passed,
      averageScore: Math.round(totalScore / applicants.length),
      positionStats
    };
  }, [applicants]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    if (!applicants || applicants.length === 0) return [];
    
    return [...applicants]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5)
      .map(applicant => ({
        id: applicant.id,
        applicant: applicant.fullName || `${applicant.firstName} ${applicant.lastName}`,
        position: applicant.position,
        score: applicant.testData?.percentage || applicant.testData?.overallPercentage || 0,
        timeAgo: (() => {
          const now = new Date();
          const submissionTime = new Date(applicant.submittedAt);
          const diffInHours = Math.floor((now - submissionTime) / (1000 * 60 * 60));
          
          if (diffInHours < 1) return 'Just now';
          if (diffInHours < 24) return `${diffInHours}h ago`;
          const diffInDays = Math.floor(diffInHours / 24);
          return `${diffInDays}d ago`;
        })(),
        icon: 'check-circle'
      }));
  }, [applicants]);

  // Chart data
  const chartData = useMemo(() => {
    if (!applicants || applicants.length === 0) {
      return {
        maxValue: 100,
        dataPoints: Array(7).fill().map((_, i) => ({
          value: 0,
          label: `Day ${i + 1}`
        }))
      };
    }

    const dataPoints = applicants.slice(-7).map((applicant, index) => ({
      value: applicant.testData?.percentage || applicant.testData?.overallPercentage || 0,
      label: `Day ${index + 1}`
    }));

    const maxValue = Math.max(...dataPoints.map(p => p.value), 100);

    return {
      maxValue,
      dataPoints
    };
  }, [applicants]);

  // KPI cards data
  const kpiCards = [
    {
      title: "Total Applicants",
      value: analytics.total.toString(),
      change: "+12%",
      changeType: "positive",
      color: "blue",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Pass Rate",
      value: `${analytics.total > 0 ? Math.round((analytics.passed / analytics.total) * 100) : 0}%`,
      change: "+8%",
      changeType: "positive",
      color: "green",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Avg. Score",
      value: `${analytics.averageScore}%`,
      change: "+3%",
      changeType: "positive",
      color: "purple",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Success Rate",
      value: `${analytics.total > 0 ? Math.round((analytics.passed / analytics.total) * 100) : 0}%`,
      change: "-2%",
      changeType: "negative",
      color: "amber",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  // Score distribution data
  const scoreDistribution = [
    { name: "Excellent (90-100)", value: applicants.filter(a => (a.testData?.percentage || a.testData?.overallPercentage || 0) >= 90).length, color: "bg-green-500" },
    { name: "Good (70-89)", value: applicants.filter(a => (a.testData?.percentage || a.testData?.overallPercentage || 0) >= 70 && (a.testData?.percentage || a.testData?.overallPercentage || 0) < 90).length, color: "bg-blue-500" },
    { name: "Average (50-69)", value: applicants.filter(a => (a.testData?.percentage || a.testData?.overallPercentage || 0) >= 50 && (a.testData?.percentage || a.testData?.overallPercentage || 0) < 70).length, color: "bg-yellow-500" },
    { name: "Poor (<50)", value: applicants.filter(a => (a.testData?.percentage || a.testData?.overallPercentage || 0) < 50).length, color: "bg-red-500" }
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Good morning, Admin!</h2>
              <p className="mt-1 opacity-90">Here's what's happening with your recruitment platform today.</p>
            </div>
            <div className="flex-shrink-0">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-all duration-200 border border-white/30">
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards - Clean visual hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {kpiCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color === 'blue' ? 'bg-blue-100 text-blue-600' : card.color === 'green' ? 'bg-green-100 text-green-600' : card.color === 'purple' ? 'bg-purple-100 text-purple-600' : card.color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center text-xs font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.changeType === 'positive' ? (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  {card.change} from last period
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Analytics Section - Polished containers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Main Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <h3 className="text-lg font-bold text-gray-900">Performance Overview</h3>
              <div className="flex space-x-2">
                <select 
                  value={chartView}
                  onChange={(e) => setChartView(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="h-80 relative overflow-hidden" ref={chartContainerRef}>
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y, i) => (
                  <line 
                    key={i}
                    x1="0" 
                    y1={y} 
                    x2="100" 
                    y2={y} 
                    stroke="#E5E7EB" 
                    strokeWidth="0.2" 
                  />
                ))}
                
                {/* Y-axis labels */}
                <text x="2" y="5" fontSize="2.5" fill="#6B7280">{chartData.maxValue}</text>
                <text x="2" y="25" fontSize="2.5" fill="#6B7280">{Math.round(chartData.maxValue * 0.75)}</text>
                <text x="2" y="50" fontSize="2.5" fill="#6B7280">{Math.round(chartData.maxValue * 0.5)}</text>
                <text x="2" y="75" fontSize="2.5" fill="#6B7280">{Math.round(chartData.maxValue * 0.25)}</text>
                <text x="2" y="95" fontSize="2.5" fill="#6B7280">0</text>
                
                {/* Animated Area */}
                <path
                  d={generateAreaPath()}
                  fill="url(#areaGradient)"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Animated Line */}
                <path
                  d={generateAnimatedPath()}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-sm transition-all duration-1000 ease-out"
                />
                
                {/* Data points */}
                {chartData.dataPoints.map((point, i) => {
                  const x = (i / (chartData.dataPoints.length - 1)) * 100;
                  const y = 100 - (point.value / chartData.maxValue) * 90;
                  
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="1"
                        fill="#3B82F6"
                        className="cursor-pointer hover:r-1.5 transition-all"
                        onMouseEnter={() => setHoveredPoint({ index: i, point })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      
                      {/* Tooltip */}
                      {hoveredPoint && hoveredPoint.index === i && (
                        <g>
                          <rect 
                            x={x - 15} 
                            y={y - 15} 
                            width="30" 
                            height="15" 
                            rx="2" 
                            fill="#1F2937" 
                          />
                          <text 
                            x={x} 
                            y={y - 5} 
                            textAnchor="middle" 
                            fill="white" 
                            fontSize="2.5" 
                            fontWeight="bold"
                          >
                            {point.value}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* X-axis labels - Clean */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                {chartData.dataPoints.map((point, index) => (
                  <div key={index} className="text-[10px] text-gray-500 transform -translate-x-1/2 whitespace-nowrap" style={{ marginLeft: `${(index / (chartData.dataPoints.length - 1)) * 100}%` }}>
                    {point.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Score Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Score Distribution</h3>
            <div className="space-y-5">
              {scoreDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`} 
                      style={{ width: `${analytics.total > 0 ? (item.value / analytics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Top Positions</h4>
              <div className="space-y-3">
                {Object.entries(analytics.positionStats)
                  .sort(([,a], [,b]) => b.avgScore - a.avgScore)
                  .slice(0, 3)
                  .map(([position, stats], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{position}</span>
                      <span className="text-sm font-medium text-gray-900">{stats.avgScore}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Quick Actions - Simplified cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <button 
                onClick={() => navigate('/admin/applicants')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {activity.icon === 'user-add' && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        )}
                        {activity.icon === 'check-circle' && (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {activity.icon === 'star' && (
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.applicant} scored {activity.score}%
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.position && `${activity.position} • `}
                        {activity.timeAgo}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/admin/applicants')}
                className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900">Manage Applicants</h4>
                  <p className="text-xs text-gray-500 mt-1">View and manage all applicants</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900">View Analytics</h4>
                  <p className="text-xs text-gray-500 mt-1">Deep dive into performance metrics</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/reports')}
                className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <h4 className="text-sm font-medium text-gray-900">Generate Reports</h4>
                  <p className="text-xs text-gray-500 mt-1">Create detailed performance reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PremiumDashboard;