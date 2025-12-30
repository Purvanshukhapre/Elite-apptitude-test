import React from 'react';

const BarChart = ({ 
  data, 
  title = null,
  barColor = 'bg-blue-500',
  className = '' 
}) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-8 h-8 flex items-center justify-center text-gray-600 font-medium">
                {item.count}
              </div>
              <div className="flex items-center space-x-1">
                {item.label}
              </div>
            </div>
            <div className="w-32">
              <div className="text-right text-sm text-gray-600 mb-1">{item.percentage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${barColor}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;