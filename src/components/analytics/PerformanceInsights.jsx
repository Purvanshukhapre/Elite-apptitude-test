
const PerformanceInsights = ({ analytics }) => {
  return (
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
  );
};

export default PerformanceInsights;