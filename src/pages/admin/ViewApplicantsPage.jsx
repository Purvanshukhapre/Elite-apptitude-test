import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { getApplicants } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import StarRating from '../../components/StarRating';

const ViewApplicantsPage = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useApp();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch all applicants
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const data = await getApplicants();
        setApplicants(data);
      } catch (error) {
        console.error('Failed to fetch applicants:', error);
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAdminAuthenticated) {
      fetchApplicants();
    } else {
      setLoading(false);
    }
  }, [isAdminAuthenticated]);

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = [...new Set(applicants.map(app => app.postAppliedFor || app.position || 'N/A'))];
    return positions.filter(pos => pos !== 'N/A');
  }, [applicants]);

  // Filter and search applicants
  const filteredApplicants = useMemo(() => {
    let filtered = applicants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(applicant => 
        (applicant.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.postAppliedFor || applicant.position || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(applicant => applicant.testData || applicant.correctAnswer !== undefined);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(applicant => !applicant.testData && applicant.correctAnswer === undefined);
      }
    }

    // Position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(applicant => 
        (applicant.postAppliedFor || applicant.position || 'N/A') === positionFilter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.fullName || a.name || '').localeCompare(b.fullName || b.name || '');
          break;
        case 'position':
          comparison = (a.postAppliedFor || a.position || '').localeCompare(b.postAppliedFor || b.position || '');
          break;
        case 'date':
          comparison = new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0);
          break;
        case 'score': {
          const scoreA = a.testData?.percentage !== undefined ? a.testData.percentage : 
                        a.correctAnswer !== undefined ? (a.correctAnswer / (a.testData?.totalQuestions || 1)) * 100 :
                        a.rating !== undefined ? (a.rating / 5) * 100 : 0;
          const scoreB = b.testData?.percentage !== undefined ? b.testData.percentage : 
                        b.correctAnswer !== undefined ? (b.correctAnswer / (b.testData?.totalQuestions || 1)) * 100 :
                        b.rating !== undefined ? (b.rating / 5) * 100 : 0;
          comparison = scoreB - scoreA;
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [applicants, searchTerm, statusFilter, positionFilter, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = applicants.length;
    const completed = applicants.filter(app => app.testData || app.correctAnswer !== undefined).length;
    const pending = total - completed;
    const avgScore = completed > 0 
      ? applicants.reduce((sum, app) => {
          if (app.testData?.percentage !== undefined) return sum + app.testData.percentage;
          if (app.correctAnswer !== undefined && app.testData?.totalQuestions) {
            return sum + ((app.correctAnswer / app.testData.totalQuestions) * 100);
          }
          if (app.correctAnswer !== undefined) return sum + app.correctAnswer;
          if (app.rating !== undefined) return sum + ((app.rating / 5) * 100);
          return sum;
        }, 0) / completed
      : 0;

    return { total, completed, pending, avgScore: avgScore.toFixed(1) };
  }, [applicants]);

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <AdminLayout activeTab="applicants">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">View All Applicants</h1>
          <p className="text-gray-600">Detailed information and analytics for all applicants</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Positions</option>
                {uniquePositions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="score-desc">Score (High-Low)</option>
                <option value="score-asc">Score (Low-High)</option>
                <option value="position-asc">Position (A-Z)</option>
                <option value="position-desc">Position (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading applicants...</p>
              </div>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant._id || applicant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(applicant.fullName || applicant.name || 'A').charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{applicant.fullName || applicant.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{applicant.fatherName ? `Son of ${applicant.fatherName}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{applicant.postAppliedFor || applicant.position || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{applicant.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{applicant.permanentPhone || applicant.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(applicant.testData || applicant.correctAnswer !== undefined) ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {applicant.testData?.percentage !== undefined ? (
                          <span className="font-bold">{applicant.testData.percentage}%</span>
                        ) : applicant.correctAnswer !== undefined && applicant.testData?.totalQuestions ? (
                          <span className="font-bold">{applicant.correctAnswer}/{applicant.testData.totalQuestions} ({((applicant.correctAnswer / applicant.testData.totalQuestions) * 100).toFixed(1)}%)</span>
                        ) : applicant.correctAnswer !== undefined ? (
                          <span className="font-bold">{applicant.correctAnswer} correct</span>
                        ) : applicant.rating !== undefined && applicant.rating !== null ? (
                          <span className="font-bold">{((applicant.rating / 5) * 100).toFixed(1)}%</span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {applicant.rating !== undefined && applicant.rating > 0 ? (
                          <StarRating rating={applicant.rating} maxRating={5} />
                        ) : (
                          <span className="text-gray-500 text-sm">No rating</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(applicant.submittedAt || applicant.createdAt || new Date(0)).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/applicant/${encodeURIComponent(applicant.fullName || applicant.name || 'Unknown')}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                        >
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination would go here if needed */}
        {filteredApplicants.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">
              Showing {filteredApplicants.length} of {applicants.length} applicants
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ViewApplicantsPage;