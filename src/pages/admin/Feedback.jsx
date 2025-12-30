import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import { getAllFeedback } from '../../api';
import StarRating from '../../components/StarRating';

const Feedback = () => {
  const { applicants, isAdminAuthenticated } = useApp();
  const [feedbackData, setFeedbackData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

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
      if (isAdminAuthenticated) {
        try {
          const data = await getAllFeedback();
          setFeedbackData(data);
        } catch (error) {
          console.error('Error fetching feedback:', error);
          setFeedbackData([]);
        }
      }
    };
    
    fetchFeedback();
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

  // Get all feedback (including standalone feedback not linked to applicants)
  const allFeedback = useMemo(() => {
    const applicantFeedback = combinedApplicants
      .filter(applicant => applicant.feedback)
      .map(applicant => ({
        ...applicant.feedback,
        applicant: applicant,
        score: getNumericScore(applicant)
      }));
    
    // Get standalone feedback that's not linked to applicants
    const standaloneFeedback = feedbackData.filter(feedback => 
      !combinedApplicants.some(applicant => 
        feedback.email === applicant.email || feedback.name === applicant.fullName
      )
    );
    
    return [...applicantFeedback, ...standaloneFeedback];
  }, [combinedApplicants, feedbackData]);

  // Filter and sort feedback
  const filteredFeedback = useMemo(() => {
    let filtered = allFeedback.filter(feedback => {
      const matchesSearch = 
        feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          aValue = new Date(a.createdAt || a.updatedAt || '1970-01-01');
          bValue = new Date(b.createdAt || b.updatedAt || '1970-01-01');
          break;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [allFeedback, searchTerm, ratingFilter, sortBy, sortOrder]);

  // Analytics data
  const analytics = useMemo(() => {
    const total = allFeedback.length;
    const avgRating = total > 0 ? (allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1) : 0;
    
    const ratingDistribution = {
      5: allFeedback.filter(f => f.rating === 5).length,
      4: allFeedback.filter(f => f.rating === 4).length,
      3: allFeedback.filter(f => f.rating === 3).length,
      2: allFeedback.filter(f => f.rating === 2).length,
      1: allFeedback.filter(f => f.rating === 1).length
    };
    
    const positive = allFeedback.filter(f => f.rating >= 4).length;
    const neutral = allFeedback.filter(f => f.rating === 3).length;
    const negative = allFeedback.filter(f => f.rating <= 2).length;

    return {
      total,
      avgRating,
      ratingDistribution,
      positive,
      neutral,
      negative
    };
  }, [allFeedback]);

  return (
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feedback</h1>
        </div>

        {/* Feedback Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Feedback Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
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
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="space-y-4">
              {filteredFeedback.map((feedback, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {(feedback.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{feedback.name || 'Anonymous'}</h4>
                        <p className="text-xs text-gray-500">{feedback.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <StarRating rating={feedback.rating} maxRating={5} />
                        <span className="text-sm font-semibold text-gray-900">{feedback.rating}/5</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.createdAt || feedback.updatedAt || '1970-01-01').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">{feedback.comment}</p>
                  </div>
                  
                  {feedback.applicant && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">Related Applicant</h5>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{feedback.applicant.fullName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{feedback.applicant.postAppliedFor || feedback.applicant.position || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{getNumericScore(feedback.applicant).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default Feedback;