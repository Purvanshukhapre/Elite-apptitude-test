import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { useAdminData } from '../../hooks/useAdminData';
import { getNumericScore } from '../../utils/helpers';
import StarRating from '../../components/shared/StarRating';

const Applicants = () => {
  const navigate = useNavigate();
  const { applicants, refreshApplicants } = useApp();
  const { fetchFeedback, fetchTestResults } = useAdminData();
  const [feedbackData, setFeedbackData] = useState([]);
  const [testResults, setTestResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default items per page
  
  // Ref for the main container to scroll to
  const mainContainerRef = useRef(null);

  const handleRowClick = (applicant) => {
    // Use the exact 'id' field from the API response - this is the correct ID needed
    const applicantId = applicant.id;
    if (applicantId) {
      navigate(`/admin/modern/applicants/${encodeURIComponent(applicantId)}`);
    } else {
      console.error('No valid ID found for applicant:', applicant);
      // The ID should always be available as it comes from the API response
    }
  };

  // Fetch feedback and test results data on component mount
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
        
        // Fetch feedback data using the new hook
        const feedback = await fetchFeedback();
        if (!isCancelled) {
          setFeedbackData(feedback);
        }
        
        // Fetch test results data using the new hook
        const testResults = await fetchTestResults();
        if (!isCancelled) {
          setTestResults(testResults);
        }
      } catch (error) {
        console.error('Error fetching data in Applicants:', error);
        if (!isCancelled) {
          setFeedbackData([]);
          setTestResults([]);
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

  // Combine applicants with feedback and test results data
  // 🔒 PRESERVE ORIGINAL APPLICANT ID - NEVER OVERRIDE THE MAIN ID
  const combinedApplicants = applicants.map(applicant => {
    // 🔥 CRITICAL: Store the original ID before any processing
    const originalId = applicant.id;
    
    const applicantFeedback = feedbackData.find(feedback => 
      // Priority 1: Match by ID if available
      (feedback.studentFormId && applicant.studentFormId && feedback.studentFormId === applicant.studentFormId) ||
      (feedback.id && applicant.id && feedback.id === applicant.id) ||
      // Priority 2: Match by email
      (feedback.email && applicant.permanentEmail && feedback.email.toLowerCase() === applicant.permanentEmail.toLowerCase()) ||
      (feedback.email && applicant.email && feedback.email.toLowerCase() === applicant.email.toLowerCase()) ||
      // Priority 3: Match by name as fallback
      (feedback.name && applicant.fullName && feedback.name.toLowerCase() === applicant.fullName.toLowerCase()) ||
      (feedback.fullName && applicant.fullName && feedback.fullName.toLowerCase() === applicant.fullName.toLowerCase())
    );
    
    // Find test results for this applicant - prioritize by ID, then email, then by name
    const applicantTestResult = testResults.find(result => 
      // Priority 1: Match by ID if available
      (result.studentFormId && applicant.studentFormId && result.studentFormId === applicant.studentFormId) ||
      (result.id && applicant.id && result.id === applicant.id) ||
      // Priority 2: Match by email
      (result.email && applicant.permanentEmail && result.email.toLowerCase() === applicant.permanentEmail.toLowerCase()) ||
      (result.email && applicant.email && result.email.toLowerCase() === applicant.email.toLowerCase()) ||
      // Priority 3: Match by name as fallback
      (result.fullName && applicant.fullName && result.fullName.toLowerCase() === applicant.fullName.toLowerCase()) ||
      (result.name && applicant.fullName && result.name.toLowerCase() === applicant.fullName.toLowerCase())
    );
    
    // 🔒 CRITICAL: Always preserve the original applicant ID
    return {
      ...applicant,
      id: originalId, // 🔥 ENSURE ORIGINAL ID IS PRESERVED
      feedback: applicantFeedback || null,
      testData: applicant.testData || null,
      rating: applicant.rating,
      correctAnswer: applicant.correctAnswer !== undefined 
        ? applicant.correctAnswer 
        : (applicant.testData?.correctAnswers !== undefined 
          ? applicant.testData.correctAnswers 
          : (applicantTestResult ? applicantTestResult.correctAnswer : applicant.correctAnswer)),
      overallRating: applicantFeedback ? applicantFeedback.rating : undefined,
      // Add test result data if available
      testResult: applicantTestResult || null
    };
  });

  // Get unique positions for filter
  const uniquePositions = ['all', ...new Set(combinedApplicants.map(applicant => applicant.postAppliedFor || applicant.position || 'Unknown'))];

  // Filter and sort applicants
  let filteredApplicants = combinedApplicants.filter(applicant => {
    const matchesSearch = 
      (applicant.fullName || applicant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (applicant.permanentEmail || applicant.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (applicant.postAppliedFor || applicant.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getNumericScore(applicant).toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && (applicant.testData || applicant.correctAnswer !== undefined)) ||
      (statusFilter === 'pending' && !applicant.testData && applicant.correctAnswer === undefined);
    
    const matchesPosition = positionFilter === 'all' || 
      (applicant.postAppliedFor || applicant.position) === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Sort applicants
  filteredApplicants.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = (a.fullName || a.name || '').toLowerCase();
        bValue = (b.fullName || b.name || '').toLowerCase();
        break;
      case 'position':
        aValue = (a.postAppliedFor || a.position || '').toLowerCase();
        bValue = (b.postAppliedFor || b.position || '').toLowerCase();
        break;
      case 'score':
        aValue = getNumericScore(a);
        bValue = getNumericScore(b);
        break;
      case 'date':
      default:
        // Try multiple date sources in order of preference
        // First, try submittedAt or createdAt if available
        const dateA = a.submittedAt || a.createdAt || a.timestamp;
        const dateB = b.submittedAt || b.createdAt || b.timestamp;
        
        if (dateA && dateB) {
          // If both have explicit date fields, use those
          aValue = new Date(dateA);
          bValue = new Date(dateB);
        } else {
          // Fallback to MongoDB _id timestamp if dates aren't available
          // Extract timestamp from MongoDB ObjectId (_id)
          const getIdTimestamp = (obj) => {
            if (obj._id && typeof obj._id === 'string' && obj._id.length >= 24) {
              try {
                return parseInt(obj._id.substring(0, 8), 16) * 1000;
              } catch {
                // If parsing fails, fall back to other methods
              }
            }
            // Also try the regular id field
            if (obj.id && typeof obj.id === 'string' && obj.id.length >= 24) {
              try {
                return parseInt(obj.id.substring(0, 8), 16) * 1000;
              } catch {
                // If parsing fails, return epoch time
              }
            }
            return new Date(0).getTime(); // Epoch time if no ID available
          };
          
          aValue = new Date(getIdTimestamp(a));
          bValue = new Date(getIdTimestamp(b));
        }
        break;
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  // Analytics data
  const total = combinedApplicants.length;
  const withTest = combinedApplicants.filter(a => a.testData || a.correctAnswer !== undefined).length;
  const withFeedback = combinedApplicants.filter(a => a.feedback).length;
  const pending = total - withTest;
  
  const scores = combinedApplicants
    .filter(a => a.testData || a.correctAnswer !== undefined)
    .map(a => getNumericScore(a));
  
  const excellent = combinedApplicants.filter(a => getNumericScore(a) >= 80).length;
  const good = combinedApplicants.filter(a => getNumericScore(a) >= 60 && getNumericScore(a) < 80).length;
  const average = combinedApplicants.filter(a => getNumericScore(a) >= 40 && getNumericScore(a) < 60).length;
  const poor = combinedApplicants.filter(a => getNumericScore(a) < 40 && getNumericScore(a) > 0).length;
  
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

  const analytics = {
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
    feedbackRate
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFilteredApplicants = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top using the ref
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to top using the ref
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to top using the ref
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div ref={mainContainerRef} className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicants Management</h1>
          <p className="text-gray-500 mt-1">Manage and review all applicant records</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Applicants</p>
              <p className="text-4xl font-bold">{analytics.total}</p>
              <p className="text-blue-100 text-xs mt-2">{analytics.pending} pending</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Tests Completed</p>
              <p className="text-4xl font-bold">{analytics.withTest}</p>
              <p className="text-green-100 text-xs mt-2">{analytics.completionRate}% completion</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Average Score</p>
              <p className="text-4xl font-bold">{analytics.avgScore}%</p>
              <p className="text-purple-100 text-xs mt-2">{analytics.excellent + analytics.good} high performers</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Avg. Time Spent</p>
              <p className="text-4xl font-bold">{analytics.avgTimeSpent} min</p>
              <p className="text-orange-100 text-xs mt-2">on test</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 font-medium"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 font-medium"
          >
            {uniquePositions.map(position => (
              <option key={position} value={position}>
                {position === 'all' ? 'All Positions' : position}
              </option>
            ))}
          </select>
          
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 font-medium"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="position">Sort by Position</option>
              <option value="score">Sort by Score</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Applicants List/Grid */}
      {currentFilteredApplicants.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No applicants found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFilteredApplicants.map((applicant, index) => {
            const hasTest = applicant.testData || applicant.correctAnswer !== undefined;
            // Add data attribute to the first card of the current page
            const isFirstCurrentPageCard = indexOfFirstItem === index + (currentPage - 1) * itemsPerPage;
            
            return (
              <div
                key={`grid-${applicant._id || applicant.id || applicant.fullName?.replace(/[^a-zA-Z0-9]/g, '') || index}-${index}`}
                onClick={() => handleRowClick(applicant)}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group ${isFirstCurrentPageCard ? 'focus:outline-none focus:ring-0' : ''}`}
                tabIndex={isFirstCurrentPageCard ? 0 : -1}
                data-page-card={isFirstCurrentPageCard ? "true" : "false"}
                style={isFirstCurrentPageCard ? { outline: 'none' } : {}}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {(applicant.fullName || applicant.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{applicant.fullName || applicant.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500 truncate">{applicant.permanentEmail || applicant.email || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    hasTest ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {hasTest ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Position</span>
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[50%]">{applicant.postAppliedFor || applicant.position || 'N/A'}</span>
                  </div>
                  {applicant.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Feedback Rating</span>
                      <StarRating rating={applicant.rating} maxRating={5} />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 truncate">
                      <div className="flex items-center space-x-1 mt-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{applicant.createdAt || "Not Available"}</span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Applicant</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Position</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Feedback Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentFilteredApplicants.map((applicant, index) => {
                  const hasTest = applicant.testData || applicant.correctAnswer !== undefined;
                  // Add data attribute to the first row of the current page
                  const isFirstCurrentPageRow = indexOfFirstItem === index + (currentPage - 1) * itemsPerPage;
                  
                  return (
                    <tr 
                      key={`row-${applicant._id || applicant.id || applicant.fullName?.replace(/[^a-zA-Z0-9]/g, '') || index}-${index}`}
                      className={`hover:bg-blue-50 transition-colors cursor-pointer ${isFirstCurrentPageRow ? 'focus:outline-none focus:ring-0' : ''}`}
                      onClick={() => handleRowClick(applicant)}
                      tabIndex={isFirstCurrentPageRow ? 0 : -1}
                      data-page-card={isFirstCurrentPageRow ? "true" : "false"}
                      style={isFirstCurrentPageRow ? { outline: 'none' } : {}}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                            {(applicant.fullName || applicant.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{applicant.fullName || applicant.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{applicant.permanentEmail || applicant.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium max-w-[150px] truncate inline-block">
                          {applicant.postAppliedFor || applicant.position || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          hasTest ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {hasTest ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {applicant.rating ? (
                          <div className="flex items-center space-x-2">
                            <StarRating rating={applicant.rating} maxRating={5} />
                            <span className="text-sm text-gray-600">({applicant.rating})</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        <div className="flex items-center space-x-1 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-gray-500">{applicant.createdAt || "Not Available"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredApplicants.length > itemsPerPage && (
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredApplicants.length)}
            </span>{' '}
            of <span className="font-medium">{filteredApplicants.length}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                // Show all pages if total is 5 or less
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // Show first 5 pages when near the beginning
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // Show last 5 pages when near the end
                pageNum = totalPages - 4 + i;
              } else {
                // Show current page in the middle
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-center text-gray-500 text-sm">
        Showing {currentFilteredApplicants.length} of {filteredApplicants.length} applicants
        {searchTerm && ` for "${searchTerm}"`}
      </div>
    </div>
  );
};

export default Applicants;

