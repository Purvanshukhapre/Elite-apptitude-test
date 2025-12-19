import React from 'react';

const PositionPerformance = ({ analytics, applicants }) => {
  return (
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
  );
};

export default PositionPerformance;