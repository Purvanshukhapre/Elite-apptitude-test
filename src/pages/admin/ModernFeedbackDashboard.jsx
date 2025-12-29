import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';

const ModernFeedbackDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminAuthenticated, adminLogout } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch feedback data on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const data = await getAllFeedback();
        setFeedbackData(data);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
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

  // Filter feedback based on search term
  const filteredFeedback = useMemo(() => {
    if (!searchTerm) return feedbackData;
    
    return feedbackData.filter(feedback => 
      (feedback.name || feedback.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.comments || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feedbackData, searchTerm]);

  // Calculate feedback analytics
  const feedbackAnalytics = useMemo(() => {
    const total = feedbackData.length;
    const avgRating = total > 0 
      ? (feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1)
      : '0.0';
    
    const ratingDistribution = {
      5: feedbackData.filter(f => f.rating === 5).length,
      4: feedbackData.filter(f => f.rating === 4).length,
      3: feedbackData.filter(f => f.rating === 3).length,
      2: feedbackData.filter(f => f.rating === 2).length,
      1: feedbackData.filter(f => f.rating === 1).length,
    };

    return {
      total,
      avgRating,
      ratingDistribution
    };
  }, [feedbackData]);

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
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex items-center justify-center p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-xl">EA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Elite Associate</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white border border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-colors border border-red-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">

                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Feedback Analytics
                  </h1>
                  <p className="text-sm text-gray-500">Review and analyze candidate feedback</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search feedback..."
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

        {/* Feedback Content */}
        <main className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.avgRating}</p>
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
                  <p className="text-sm font-bold text-gray-500">5-Star</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.ratingDistribution[5]}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedbackAnalytics.total > 0 
                      ? Math.round((feedbackAnalytics.ratingDistribution[4] + feedbackAnalytics.ratingDistribution[5]) / feedbackAnalytics.total * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Distribution</h3>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-600">{rating}★</div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${feedbackAnalytics.total > 0 ? (feedbackAnalytics.ratingDistribution[rating] / feedbackAnalytics.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-sm font-medium text-gray-600">
                          {feedbackAnalytics.ratingDistribution[rating]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Feedback Summary</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Positive Feedback</span>
                    <span className="font-bold text-green-600">
                      {feedbackAnalytics.total > 0 
                        ? Math.round((feedbackAnalytics.ratingDistribution[4] + feedbackAnalytics.ratingDistribution[5]) / feedbackAnalytics.total * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutral Feedback</span>
                    <span className="font-bold text-amber-600">
                      {feedbackAnalytics.total > 0 
                        ? Math.round(feedbackAnalytics.ratingDistribution[3] / feedbackAnalytics.total * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Negative Feedback</span>
                    <span className="font-bold text-red-600">
                      {feedbackAnalytics.total > 0 
                        ? Math.round((feedbackAnalytics.ratingDistribution[1] + feedbackAnalytics.ratingDistribution[2]) / feedbackAnalytics.total * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-xl shadow-gray-900/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Feedback</h3>
              <span className="text-sm text-gray-500">{filteredFeedback.length} feedback entries</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500">Loading feedback...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFeedback.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFeedback.map((feedback, index) => (
                        <tr key={feedback._id || feedback.id || feedback.email || `feedback-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {(feedback.name || feedback.fullName || 'A').charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{feedback.name || feedback.fullName || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">{feedback.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <StarRating rating={feedback.rating} maxRating={5} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {feedback.comments || feedback.problem5 || 'No comments provided'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(feedback.submittedAt || feedback.timestamp || feedback.createdAt || new Date(0)).toLocaleDateString()}
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

export default ModernFeedbackDashboard;