import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
const AdminDashboardUltimate = () => {
  const navigate = useNavigate();
  const { applicants, isAdminAuthenticated, adminLogout } = useApp();
  
  // Add CSS for animations
  const style = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeInUp {
      animation: fadeInUp 0.3s ease-out forwards;
    }
    
    /* Staggered animations for chart points */
    .animate-fadeIn {
      opacity: 0;
      animation-fill-mode: forwards;
    }
  `;
  
  const [chartView, setChartView] = useState('daily');
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  // Comprehensive Analytics
  const analytics = useMemo(() => {
    const total = applicants.length;
    const withTest = applicants.filter(a => a.testData).length;
    const withFeedback = applicants.filter(a => a.feedback).length;
    const pending = total - withTest;
    
    // Score distribution
    const excellent = applicants.filter(a => a.testData && parseFloat(a.testData.percentage) >= 80).length;
    const good = applicants.filter(a => a.testData && parseFloat(a.testData.percentage) >= 60 && parseFloat(a.testData.percentage) < 80).length;
    const average = applicants.filter(a => a.testData && parseFloat(a.testData.percentage) >= 40 && parseFloat(a.testData.percentage) < 60).length;
    const poor = applicants.filter(a => a.testData && parseFloat(a.testData.percentage) < 40).length;
    
    // Average metrics
    const avgScore = withTest > 0
      ? (applicants.filter(a => a.testData).reduce((sum, a) => sum + parseFloat(a.testData.percentage), 0) / withTest).toFixed(1)
      : 0;
      
    const avgTimeSpent = withTest > 0
      ? Math.round(applicants.filter(a => a.testData).reduce((sum, a) => sum + (a.testData.timeSpent || 0), 0) / withTest / 60)
      : 0;
    
    // Completion rate
    const completionRate = total > 0 ? ((withTest / total) * 100).toFixed(1) : 0;
    const feedbackRate = withTest > 0 ? ((withFeedback / withTest) * 100).toFixed(1) : 0;
    
    // Position breakdown
    const positionStats = {};
    applicants.forEach(a => {
      if (!positionStats[a.position]) {
        positionStats[a.position] = { total: 0, tested: 0, avgScore: 0, scores: [] };
      }
      positionStats[a.position].total++;
      if (a.testData) {
        positionStats[a.position].tested++;
        positionStats[a.position].scores.push(parseFloat(a.testData.percentage));
      }
    });
    
    Object.keys(positionStats).forEach(pos => {
      const scores = positionStats[pos].scores;
      positionStats[pos].avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });
    
    // Recent activity (last 24 hours)
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentApplicants = applicants.filter(a => new Date(a.submittedAt) > last24h).length;
    const recentTests = applicants.filter(a => a.testCompletedAt && new Date(a.testCompletedAt) > last24h).length;

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
      positionStats,
      recentApplicants,
      recentTests
    };
  }, [applicants]);

  // Chart Data Generator
  const chartData = useMemo(() => {
    const now = new Date();
    const dataPoints = [];

    if (chartView === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const count = applicants.filter(a => {
          const testDate = a.testCompletedAt ? new Date(a.testCompletedAt) : null;
          return testDate && testDate >= dayStart && testDate <= dayEnd;
        }).length;

        dataPoints.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: count,
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
    } else if (chartView === 'weekly') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const count = applicants.filter(a => {
          const testDate = a.testCompletedAt ? new Date(a.testCompletedAt) : null;
          return testDate && testDate >= weekStart && testDate <= weekEnd;
        }).length;

        dataPoints.push({
          label: `W${Math.ceil((weekEnd.getDate()) / 7)}`,
          value: count,
          fullDate: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const count = applicants.filter(a => {
          const testDate = a.testCompletedAt ? new Date(a.testCompletedAt) : null;
          return testDate && testDate >= monthStart && testDate <= monthEnd;
        }).length;

        dataPoints.push({
          label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          value: count,
          fullDate: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
    }

    const maxValue = Math.max(...dataPoints.map(d => d.value), 1);
    return { dataPoints, maxValue };
  }, [applicants, chartView]);

  // Recent activity timeline
  const recentActivity = useMemo(() => {
    const activities = [];
    
    applicants.forEach(applicant => {
      // Registration
      activities.push({
        type: 'registration',
        applicant: applicant.fullName,
        position: applicant.position,
        timestamp: new Date(applicant.submittedAt),
        icon: 'user-add'
      });
      
      // Test completion
      if (applicant.testCompletedAt) {
        activities.push({
          type: 'test',
          applicant: applicant.fullName,
          score: applicant.testData?.percentage,
          timestamp: new Date(applicant.testCompletedAt),
          icon: 'check-circle'
        });
      }
      
      // Feedback
      if (applicant.feedback) {
        activities.push({
          type: 'feedback',
          applicant: applicant.fullName,
          rating: applicant.feedback.overallRating,
          timestamp: new Date(applicant.testCompletedAt), // Using test completion as proxy
          icon: 'star'
        });
      }
    });
    
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [applicants]);

  // Get icon component based on type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'registration':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'test':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'feedback':
        return (
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-.38 1.81.588 1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/20 flex">
      <style>{style}</style>
      {/* Left Sidebar - Icon Navigation */}
      <div className="hidden lg:flex flex-col w-20 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 fixed h-screen z-50 shadow-xl shadow-gray-900/5">
        <div className="flex items-center justify-center h-20 border-b border-gray-200/50">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2">
          {[
            { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true, label: 'Dashboard', path: '/admin/dashboard' },
            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: 'Applicants', path: '/admin/applicants' },
            { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Analytics', path: '/admin/analytics' },
            { icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', label: 'Reports', path: '/admin/reports' },
            { icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', label: 'Feedback', path: '/admin/feedback' },
            { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/admin/settings' },
          ].map((item, idx) => (
            <button
              key={idx}
              title={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full p-3 rounded-xl transition-all group relative ${
                item.active
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
            </button>
          ))}
        </nav>
        
        <div className="p-3 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full p-3 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-20">
        {/* Top Navigation Bar */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-sm shadow-gray-900/5">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Recruitment Analytics
                </h1>
                <p className="text-sm text-gray-500 font-medium">Elite Associate</p>
              </div>
              
              {/* Right Actions */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/80">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">Live</span>
                </div>
                
                <button className="relative group w-11 h-11 rounded-full flex items-center justify-center text-white transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full group-hover:shadow-lg group-hover:shadow-blue-300/50 transition-all"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                <button className="relative w-11 h-11 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
                
                <div className="flex items-center space-x-3 pl-3 ml-3 border-l border-gray-200/60">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Recruitment Manager</p>
                  </div>
                  <div className="w-11 h-11 relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full group-hover:shadow-lg group-hover:shadow-purple-300/50 transition-all"></div>
                    <div className="relative w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                      AU
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Applicants */}
            <div className="group relative bg-white rounded-2xl p-6 border border-gray-200/60 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur-md opacity-25"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">Total</div>
              </div>
              <div className="relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applicants</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{analytics.total}</p>
                <div className="flex items-center text-xs text-green-600 font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +{analytics.recentApplicants} today
                </div>
              </div>
            </div>

            {/* Tests Completed */}
            <div className="group relative bg-white rounded-2xl p-6 border border-gray-200/60 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-green-500 to-green-600 rounded-xl blur-md opacity-25"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">Progress</div>
              </div>
              <div className="relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tests Taken</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{analytics.withTest}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all" style={{width: `${analytics.completionRate}%`}}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-600">{analytics.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Avg Score */}
            <div className="group relative bg-white rounded-2xl p-6 border border-gray-200/60 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl blur-md opacity-25"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">Performance</div>
              </div>
              <div className="relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{analytics.avgScore}%</p>
                <div className="flex items-center text-xs text-gray-600 font-semibold">
                  <span>Avg time: {analytics.avgTimeSpent}m</span>
                </div>
              </div>
            </div>

            {/* Excellent Scores */}
            <div className="group relative bg-white rounded-2xl p-6 border border-gray-200/60 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl blur-md opacity-25"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/30">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">Top Tier</div>
              </div>
              <div className="relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Excellent (80%+)</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{analytics.excellent}</p>
                <div className="flex items-center text-xs text-amber-600 font-semibold">
                  <span>{analytics.excellent > 0 ? ((analytics.excellent / analytics.withTest) * 100).toFixed(1) : 0}% of tested</span>
                </div>
              </div>
            </div>

            {/* Feedback Rate */}
            <div className="group relative bg-white rounded-2xl p-6 border border-gray-200/60 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl blur-md opacity-25"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">Engagement</div>
              </div>
              <div className="relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Feedback Rate</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{analytics.feedbackRate}%</p>
                <div className="flex items-center text-xs text-indigo-600 font-semibold">
                  <span>{analytics.withFeedback} responses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Performance Charts */}
            <div className="lg:col-span-2 space-y-8">
              {/* Simplified Performance Chart - Only main student performance */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-2xl shadow-gray-900/5 overflow-hidden hover:shadow-3xl hover:shadow-gray-900/10 transition-all duration-300 group transform hover:-translate-y-1">
                <div className="p-8 border-b border-gray-100/80">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">Student Performance Overview</h2>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 font-medium transition-all duration-300 group-hover:text-gray-700">Overall candidate performance trends</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/60 shadow-inner transition-all duration-300 group-hover:bg-gray-200/50">
                      <button
                        onClick={() => setChartView('daily')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${chartView === 'daily' ? 'bg-white text-gray-900 shadow-lg shadow-gray-900/10 transform scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:scale-105'}`}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => setChartView('weekly')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${chartView === 'weekly' ? 'bg-white text-gray-900 shadow-lg shadow-gray-900/10 transform scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:scale-105'}`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setChartView('monthly')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${chartView === 'monthly' ? 'bg-white text-gray-900 shadow-lg shadow-gray-900/10 transform scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:scale-105'}`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                </div>

                {/* Premium Line Graph */}
                <div className="p-8 bg-gradient-to-b from-slate-50/50 via-white to-blue-50/20 transition-all duration-500 group-hover:from-slate-50/70 group-hover:to-blue-50/30 relative overflow-hidden">
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl"></div>
                  </div>
                  
                  {/* Loading overlay */}
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-bold text-gray-700">Updating live data...</p>
                    </div>
                  </div>
                  <div className="relative" style={{height: '400px'}}>
                    {/* Animated grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-gray-200/60 transition-all duration-300 group-hover:border-gray-300/40"></div>
                      ))}
                    </div>

                    {/* Y-axis with enhanced labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-gray-500 pr-4 w-12 transition-all duration-300 group-hover:text-gray-700">
                      <span className="transition-all duration-300 hover:text-blue-600 cursor-pointer">{chartData.maxValue}</span>
                      <span className="transition-all duration-300 hover:text-blue-600 cursor-pointer">{Math.floor(chartData.maxValue * 0.75)}</span>
                      <span className="transition-all duration-300 hover:text-blue-600 cursor-pointer">{Math.floor(chartData.maxValue * 0.5)}</span>
                      <span className="transition-all duration-300 hover:text-blue-600 cursor-pointer">{Math.floor(chartData.maxValue * 0.25)}</span>
                      <span className="transition-all duration-300 hover:text-blue-600 cursor-pointer">0</span>
                    </div>

                    {/* Chart area */}
                    <div className="absolute left-16 right-0 top-0 bottom-12">
                      <svg className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                            <stop offset="50%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#6366F1', stopOpacity: 1}} />
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.2}} />
                            <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 0.02}} />
                          </linearGradient>
                        </defs>
                        
                        {/* Animated Area under the line */}
                        {chartData.dataPoints.length > 0 && (
                          <path
                            d={`M 0 400 ${chartData.dataPoints.map((point, i) => {
                              const x = (i / (chartData.dataPoints.length - 1)) * 100;
                              const y = 400 - (point.value / chartData.maxValue) * 388;
                              return `L ${x} ${y}`;
                            }).join(' ')} L 100 400 Z`}
                            fill="url(#areaGradient)"
                            className="transition-all duration-1000 ease-out"
                          />
                        )}
                        
                        {/* Animated Line with gradient */}
                        {chartData.dataPoints.length > 0 && (
                          <path
                            d={`M 0 ${400 - (chartData.dataPoints[0].value / chartData.maxValue) * 388} ${chartData.dataPoints.map((point, i) => {
                              const x = (i / (chartData.dataPoints.length - 1)) * 100;
                              const y = 400 - (point.value / chartData.maxValue) * 388;
                              return `L ${x} ${y}`;
                            }).join(' ')}`}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-lg transition-all duration-1000 ease-out"
                          />
                        )}
                        
                        {/* Data points with enhanced interactivity */}
                        {chartData.dataPoints.map((point, i) => {
                          const x = (i / (chartData.dataPoints.length - 1)) * 100;
                          const y = 400 - (point.value / chartData.maxValue) * 388;
                          return (
                            <g key={i} className="transition-all duration-300 hover:scale-110">
                              {/* Invisible larger hover area for better UX */}
                              <circle
                                cx={`${x}`}
                                cy={y}
                                r="20"
                                fill="transparent"
                                className="cursor-pointer opacity-0 hover:opacity-10 transition-opacity"
                              />
                              
                              {/* Visible point with glow effect on hover */}
                              <circle
                                cx={`${x}`}
                                cy={y}
                                r="8"
                                fill="white"
                                stroke="url(#lineGradient)"
                                strokeWidth="4"
                                className="drop-shadow-md transition-all duration-300 cursor-pointer hover:r-10 hover:stroke-[#8B5CF6]"
                              />
                              
                              {/* Glow effect */}
                              <circle
                                cx={`${x}`}
                                cy={y}
                                r="12"
                                fill="url(#lineGradient)"
                                className="opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-20"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Enhanced Hover tooltips with live data */}
                      <div className="absolute inset-0 flex justify-between items-end pointer-events-none">
                        {chartData.dataPoints.map((point, index) => (
                          <div key={index} className="flex-1 flex justify-center group relative">
                            <div className="relative h-full">
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 scale-95 group-hover:scale-100 animate-fadeInUp">
                                <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-bold whitespace-nowrap">
                                  <div className="text-center">
                                    <div className="text-lg">{point.value}</div>
                                    <div className="text-xs text-gray-300">{point.value === 1 ? 'test' : 'tests'}</div>
                                    <div className="text-xs text-gray-400 mt-1">{point.fullDate}</div>
                                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                  </div>
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                    <div className="border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* X-axis labels with enhanced interactivity */}
                    <div className="absolute bottom-0 left-16 right-0 flex justify-between transition-all duration-300 group-hover:text-gray-700">
                      {chartData.dataPoints.map((point, index) => (
                        <div key={index} className="text-xs font-bold text-gray-600 text-center transition-all duration-300 hover:text-blue-600 hover:scale-110 cursor-pointer">
                          {point.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart Insights with enhanced interactivity */}
                <div className="px-8 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-6 border border-blue-200/60 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Total</p>
                          <p className="text-3xl font-bold text-blue-900 transition-all duration-300 group-hover:text-blue-700">{chartData.dataPoints.reduce((sum, p) => sum + p.value, 0)}</p>
                        </div>
                        <div className="p-2.5 bg-blue-500 rounded-lg transition-all duration-300 group-hover:bg-blue-600">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl p-6 border border-green-200/60 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/60 transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Peak</p>
                          <p className="text-3xl font-bold text-green-900 transition-all duration-300 group-hover:text-green-700">{Math.max(...chartData.dataPoints.map(p => p.value))}</p>
                        </div>
                        <div className="p-2.5 bg-green-500 rounded-lg transition-all duration-300 group-hover:bg-green-600">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-6 border border-purple-200/60 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-200/60 transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Average</p>
                          <p className="text-3xl font-bold text-purple-900 transition-all duration-300 group-hover:text-purple-700">{(chartData.dataPoints.reduce((sum, p) => sum + p.value, 0) / chartData.dataPoints.length).toFixed(1)}</p>
                        </div>
                        <div className="p-2.5 bg-purple-500 rounded-lg transition-all duration-300 group-hover:bg-purple-600">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-2xl p-6 border border-amber-200/60 shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-200/60 transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Trend</p>
                          <p className="text-3xl font-bold text-amber-900 transition-all duration-300 group-hover:text-amber-700">
                            {chartData.dataPoints[chartData.dataPoints.length - 1].value > chartData.dataPoints[0].value ? '+' : ''}
                            {chartData.dataPoints[0].value > 0 ? ((chartData.dataPoints[chartData.dataPoints.length - 1].value - chartData.dataPoints[0].value) / chartData.dataPoints[0].value * 100).toFixed(0) : '0'}%
                          </p>
                        </div>
                        <div className="p-2.5 bg-amber-500 rounded-lg transition-all duration-300 group-hover:bg-amber-600">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Avg Score</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">76.4%</p>
                    </div>
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center text-xs text-blue-700">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>+2.3% from last month</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Completion</p>
                      <p className="text-xl font-bold text-purple-900 mt-1">84.2%</p>
                    </div>
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center text-xs text-purple-700">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>+5.1% from last month</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Avg Time</p>
                      <p className="text-xl font-bold text-green-900 mt-1">3.2 min</p>
                    </div>
                    <div className="p-2 bg-green-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center text-xs text-green-700">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>+0.4 min from last month</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Top Score</p>
                      <p className="text-xl font-bold text-amber-900 mt-1">94.7%</p>
                    </div>
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center text-xs text-amber-700">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>+1.2% from last month</span>
                    </div>
                  </div>
                </div>
              
                {/* View Detailed Analytics Button */}
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => navigate('/admin/analytics')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>View Detailed Analytics</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">Recent Feedback</h2>
                      <p className="text-sm text-gray-500 font-medium">Latest candidate feedback</p>
                    </div>
                    <button 
                      onClick={() => navigate('/admin/feedback')}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {applicants.filter(a => a.feedback).slice(0, 3).map((applicant, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {applicant.fullName.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {applicant.fullName}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(applicant.feedback.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${star <= applicant.feedback.overallRating ? 'text-amber-500' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                            <span className="text-xs font-medium text-gray-600 ml-1">{applicant.feedback.overallRating}/5</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {applicant.feedback.comments || "No additional comments provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {applicants.filter(a => a.feedback).length === 0 && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm text-gray-500">No feedback received yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
                <div className="p-8 border-b border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">Score Distribution</h2>
                      <p className="text-sm text-gray-500 font-medium">Performance breakdown by score ranges</p>
                    </div>
                    <button 
                      onClick={() => setShowDetailedStats(!showDetailedStats)}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {showDetailedStats ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Excellent (80-100%) */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
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
                            strokeDasharray={`${(analytics.excellent / analytics.withTest) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-amber-600">{analytics.excellent}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900">Excellent</h3>
                      <p className="text-sm text-gray-500">80-100%</p>
                      <div className="mt-2 text-xs font-semibold text-amber-600">
                        {analytics.withTest > 0 ? ((analytics.excellent / analytics.withTest) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    
                    {/* Good (60-79%) */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
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
                            strokeDasharray={`${(analytics.good / analytics.withTest) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-green-600">{analytics.good}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900">Good</h3>
                      <p className="text-sm text-gray-500">60-79%</p>
                      <div className="mt-2 text-xs font-semibold text-green-600">
                        {analytics.withTest > 0 ? ((analytics.good / analytics.withTest) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    
                    {/* Average (40-59%) */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
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
                            strokeDasharray={`${(analytics.average / analytics.withTest) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">{analytics.average}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900">Average</h3>
                      <p className="text-sm text-gray-500">40-59%</p>
                      <div className="mt-2 text-xs font-semibold text-blue-600">
                        {analytics.withTest > 0 ? ((analytics.average / analytics.withTest) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    
                    {/* Poor (<40%) */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
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
                            strokeDasharray={`${(analytics.poor / analytics.withTest) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-red-600">{analytics.poor}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900">Needs Work</h3>
                      <p className="text-sm text-gray-500">&lt;40%</p>
                      <div className="mt-2 text-xs font-semibold text-red-600">
                        {analytics.withTest > 0 ? ((analytics.poor / analytics.withTest) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Position Stats */}
                  {showDetailedStats && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Position Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analytics.positionStats).map(([position, stats]) => (
                          <div key={position} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{position}</h4>
                              <span className="text-sm font-bold text-blue-600">{stats.avgScore}%</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600 mb-2">
                              <span>{stats.tested}/{stats.total} tested</span>
                              <span className="mx-2">•</span>
                              <span>{stats.total > 0 ? ((stats.tested / stats.total) * 100).toFixed(1) : 0}% completion</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                                style={{width: `${stats.tested > 0 ? (stats.tested / stats.total) * 100 : 0}%`}}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Quick Actions */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
                <div className="p-6 border-b border-gray-100/80">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">Recent Activity</h2>
                  <p className="text-sm text-gray-500 font-medium">Latest candidate interactions</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 group">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {activity.applicant}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.type === 'registration' && `Registered for ${activity.position}`}
                            {activity.type === 'test' && `Completed test with ${activity.score}%`}
                            {activity.type === 'feedback' && `Submitted feedback (${activity.rating}/5 stars)`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
                <div className="p-6 border-b border-gray-100/80">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">Quick Actions</h2>
                  <p className="text-sm text-gray-500 font-medium">Manage your recruitment process</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <button className="w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200/60 transition-all group">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Add Candidate</h3>
                      <p className="text-xs text-gray-600">Manually register a new applicant</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardUltimate;