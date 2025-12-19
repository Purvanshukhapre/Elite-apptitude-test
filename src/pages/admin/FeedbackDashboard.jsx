import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import AdminLayout from '../../components/AdminLayout';

const FeedbackDashboard = () => {
  const navigate = useNavigate();
  const { applicants, isAdminAuthenticated } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  // Get applicants with feedback
  const applicantsWithFeedback = useMemo(() => {
    return applicants.filter(applicant => applicant.feedback);
  }, [applicants]);

  // Calculate feedback statistics
  const feedbackStats = useMemo(() => {
    if (!isAdminAuthenticated) {
      return {
        total: 0,
        avgRating: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    if (applicantsWithFeedback.length === 0) {
      return {
        total: 0,
        avgRating: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRatings = applicantsWithFeedback.reduce((sum, applicant) => sum + applicant.feedback.overallRating, 0);
    const avgRating = totalRatings / applicantsWithFeedback.length;
    
    const positive = applicantsWithFeedback.filter(a => a.feedback.overallRating >= 4).length;
    const neutral = applicantsWithFeedback.filter(a => a.feedback.overallRating === 3).length;
    const negative = applicantsWithFeedback.filter(a => a.feedback.overallRating <= 2).length;
    
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    applicantsWithFeedback.forEach(applicant => {
      const rating = applicant.feedback.overallRating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });
    
    return {
      total: applicantsWithFeedback.length,
      avgRating: avgRating.toFixed(1),
      positive: Math.round((positive / applicantsWithFeedback.length) * 100),
      neutral: Math.round((neutral / applicantsWithFeedback.length) * 100),
      negative: Math.round((negative / applicantsWithFeedback.length) * 100),
      ratingCounts
    };
  }, [applicantsWithFeedback, isAdminAuthenticated]);
  // Filter and sort feedback
  const filteredFeedback = useMemo(() => {
    if (!isAdminAuthenticated) {
      return [];
    }
    let result = [...applicantsWithFeedback];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(applicant => 
        applicant.fullName.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.position.toLowerCase().includes(query)
      );
    }
    
    // Apply rating filter
    if (filter !== 'all') {
      if (filter === 'positive') {
        result = result.filter(applicant => applicant.feedback.overallRating >= 4);
      } else if (filter === 'neutral') {
        result = result.filter(applicant => applicant.feedback.overallRating === 3);
      } else if (filter === 'negative') {
        result = result.filter(applicant => applicant.feedback.overallRating <= 2);
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.feedback.submittedAt) - new Date(b.feedback.submittedAt);
        case 'rating-high':
          return b.feedback.overallRating - a.feedback.overallRating;
        case 'rating-low':
          return a.feedback.overallRating - b.feedback.overallRating;
        default: // latest first
          return new Date(b.feedback.submittedAt) - new Date(a.feedback.submittedAt);
      }
    });
    
    return result;
  }, [applicantsWithFeedback, searchQuery, filter, sortBy, isAdminAuthenticated]);

  // Render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout activeTab="feedback">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Feedback Statistics - Clean visual hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
          <div className="sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Average Rating</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{feedbackStats.avgRating}/5</p>
                <div className="flex mt-2">
                  {renderStars(Math.round(feedbackStats.avgRating))}
                </div>
              </div>
              <div className="p-4 bg-amber-500 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Positive</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{feedbackStats.positive}%</p>
                <p className="text-xs text-green-700 mt-1">4-5 stars</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Neutral</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{feedbackStats.neutral}%</p>
                <p className="text-xs text-gray-700 mt-1">3 stars</p>
              </div>
              <div className="p-3 bg-gray-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Negative</p>
                <p className="text-2xl font-bold text-red-900 mt-2">{feedbackStats.negative}%</p>
                <p className="text-xs text-red-700 mt-1">1-2 stars</p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m0 0v9m0-9h2.765a2 2 0 011.789 2.894l-3.5 7A2 2 0 0119.264 15H15m0-9l-4 9m-2.5-9l-4 9m0 0H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls - Clean layout */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or position..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="positive">Positive (4-5 stars)</option>
                <option value="neutral">Neutral (3 stars)</option>
                <option value="negative">Negative (1-2 stars)</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rated</option>
                <option value="rating-low">Lowest Rated</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Feedback List - Simplified cards */}
        <div className="space-y-5">
          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredFeedback.map((applicant) => (
              <div key={applicant.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {applicant.fullName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{applicant.fullName}</h3>
                          <p className="text-sm text-gray-500">{applicant.position} • {applicant.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted on {new Date(applicant.feedback.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                          {renderStars(applicant.feedback.overallRating)}
                          <span className="text-sm font-bold text-gray-900">{applicant.feedback.overallRating}/5</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Test Experience</p>
                            <p className="text-sm font-semibold text-gray-900">{applicant.feedback.testExperience}/5</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Question Clarity</p>
                            <p className="text-sm font-semibold text-gray-900">{applicant.feedback.questionClarity}/5</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Platform Ease</p>
                            <p className="text-sm font-semibold text-gray-900">{applicant.feedback.platformEase}/5</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time Adequacy</p>
                            <p className="text-sm font-semibold text-gray-900">{applicant.feedback.timeAdequacy}/5</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Comments:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {applicant.feedback.comments || "No additional comments provided."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        applicant.feedback.overallRating >= 4 
                          ? 'bg-green-100 text-green-800' 
                          : applicant.feedback.overallRating <= 2 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {applicant.feedback.overallRating >= 4 ? 'Positive' : applicant.feedback.overallRating <= 2 ? 'Negative' : 'Neutral'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbackDashboard;