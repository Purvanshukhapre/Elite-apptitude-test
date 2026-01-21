import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/useApp';
import { useAdminData } from '../../hooks/useAdminData';
import StarRating from '../../components/shared/StarRating';

const Feedback = () => {
  const { applicants: contextApplicants } = useApp();
  const { fetchFeedback } = useAdminData();
  const [feedbackData, setFeedbackData] = useState([]);
  const [applicantsData, setApplicantsData] = useState(contextApplicants);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        const feedback = await fetchFeedback();
        setFeedbackData(Array.isArray(feedback) ? feedback : []);
        
        // Update applicants data if it's different from context
        if (JSON.stringify(contextApplicants) !== JSON.stringify(applicantsData)) {
          setApplicantsData(contextApplicants);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setFeedbackData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
  }, [contextApplicants, fetchFeedback]);

  // Combine feedback with applicant data
  const combinedFeedback = useMemo(() => {
    return feedbackData.map(feedback => {
      // Find matching applicant based on name
      const matchingApplicant = applicantsData.find(applicant => 
        applicant.fullName === feedback.name || 
        applicant.name === feedback.name
      );
      
      // Combine all feedback fields into a single comment
      const feedbackFields = [
        feedback.problem1,
        feedback.problem2, 
        feedback.problem3,
        feedback.problem4,
        feedback.problem5
      ].filter(field => field && field.trim() !== '');
      
      const combinedComment = feedbackFields.join(' | ');
      
      return {
        ...feedback,
        comment: combinedComment || 'No detailed feedback provided.',
        applicant: matchingApplicant || null
      };
    });
  }, [feedbackData, applicantsData]);

  // Filter and sort feedback
  const filteredFeedback = useMemo(() => {
    let filtered = combinedFeedback.filter(feedback => {
      const matchesSearch = 
        feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.rating?.toString().includes(searchTerm);
      
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === 'high' && feedback.rating >= 4) ||
        (ratingFilter === 'low' && feedback.rating <= 2) ||
        (ratingFilter === 'medium' && feedback.rating === 3);
      
      return matchesSearch && matchesRating;
    });

    // Sort feedback
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'date':
        default:
          // Try to use submittedAt if available, otherwise extract from ID
          if (a.submittedAt) {
            aValue = new Date(a.submittedAt);
          } else if (a.id) {
            // Extract timestamp from MongoDB ObjectId
            const timestamp = parseInt(a.id.substring(0, 8), 16) * 1000;
            aValue = new Date(timestamp);
          } else {
            aValue = new Date(0);
          }
          
          if (b.submittedAt) {
            bValue = new Date(b.submittedAt);
          } else if (b.id) {
            // Extract timestamp from MongoDB ObjectId
            const timestamp = parseInt(b.id.substring(0, 8), 16) * 1000;
            bValue = new Date(timestamp);
          } else {
            bValue = new Date(0);
          }
          break;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [combinedFeedback, searchTerm, ratingFilter, sortBy, sortOrder]);

  // Analytics data
  const analytics = useMemo(() => {
    const total = combinedFeedback.length;
    const avgRating = total > 0 ? (combinedFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1) : 0;
    
    const ratingDistribution = {
      5: combinedFeedback.filter(f => f.rating === 5).length,
      4: combinedFeedback.filter(f => f.rating === 4).length,
      3: combinedFeedback.filter(f => f.rating === 3).length,
      2: combinedFeedback.filter(f => f.rating === 2).length,
      1: combinedFeedback.filter(f => f.rating === 1).length
    };
    
    const positive = combinedFeedback.filter(f => f.rating >= 4).length;
    const neutral = combinedFeedback.filter(f => f.rating === 3).length;
    const negative = combinedFeedback.filter(f => f.rating <= 2).length;

    return {
      total,
      avgRating,
      ratingDistribution,
      positive,
      neutral,
      negative
    };
  }, [combinedFeedback]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-1">Manage and review all user feedback</p>
        </div>

        {/* Feedback Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Feedback Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
              </div>
            </div>
          </div>

          {/* Average Rating Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgRating}/5</p>
              </div>
            </div>
          </div>

          {/* Positive Feedback Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Positive</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.positive}</p>
              </div>
            </div>
          </div>

          {/* Negative Feedback Card */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Negative</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.negative}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-600 font-medium">
                    {analytics.ratingDistribution[stars]}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(stars)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="w-32">
                  <div className="text-right text-sm text-gray-600 mb-1">{((analytics.ratingDistribution[stars] / analytics.total) * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stars >= 4 ? 'bg-green-500' : stars >= 3 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${(analytics.ratingDistribution[stars] / analytics.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="high">High (4-5 stars)</option>
              <option value="medium">Medium (3 stars)</option>
              <option value="low">Low (1-2 stars)</option>
            </select>
            
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Feedback List</h3>
            <p className="text-gray-600 text-sm">{filteredFeedback.length} feedback entries found</p>
          </div>
          
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFeedback.map((feedback, index) => {
                // Extract date from submittedAt field or from MongoDB ID
                let date;
                if (feedback.submittedAt) {
                  date = new Date(feedback.submittedAt);
                } else if (feedback.id) {
                  // Extract timestamp from MongoDB ObjectId
                  const timestamp = parseInt(feedback.id.substring(0, 8), 16) * 1000;
                  date = new Date(timestamp);
                } else {
                  date = new Date();
                }
                
                return (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                        {(feedback.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">{feedback.name || 'Anonymous'}</h4>
                        <p className="text-sm text-gray-500">Rating: {feedback.rating}/5</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <StarRating rating={feedback.rating} maxRating={5} />
                        <span className="text-sm font-semibold text-gray-900">{feedback.rating}/5</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2 text-sm">Feedback Details</h5>
                    <div className="space-y-2">
                      {feedback.problem1 && feedback.problem1.trim() !== '' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-xs font-medium text-gray-500">Test Difficulty: </span>
                          <span className="text-gray-700 text-sm">{feedback.problem1}</span>
                        </div>
                      )}
                      {feedback.problem2 && feedback.problem2.trim() !== '' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-xs font-medium text-gray-500">Platform Experience: </span>
                          <span className="text-gray-700 text-sm">{feedback.problem2}</span>
                        </div>
                      )}
                      {feedback.problem4 && feedback.problem4.trim() !== '' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-xs font-medium text-gray-500">Would Recommend: </span>
                          <span className="text-gray-700 text-sm">{feedback.problem4}</span>
                        </div>
                      )}
                      {feedback.problem3 && feedback.problem3.trim() !== '' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-xs font-medium text-gray-500">Improvements: </span>
                          <span className="text-gray-700 text-sm">{feedback.problem3}</span>
                        </div>
                      )}
                      {feedback.problem5 && feedback.problem5.trim() !== '' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-xs font-medium text-gray-500">Additional Comments: </span>
                          <span className="text-gray-700 text-sm">{feedback.problem5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {feedback.applicant && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">Related Applicant</h5>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{feedback.applicant.fullName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{feedback.applicant.postAppliedFor || feedback.applicant.position || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {feedback.applicant.email || feedback.applicant.permanentEmail || 'Email N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                )})}
            </div>
          )}
        </div>
      </div>
  );
};

export default Feedback;