import React from 'react';

const AnimatedLineChart = ({ data, title, description, color, xAxis = 'x', yAxis = 'y', minValue = 0, maxValue = 100 }) => {
  // Calculate dynamic scale based on data
  const calculateScale = () => {
    if (!data || data.length === 0) {
      return { minY: 0, maxY: 100, minX: 0, maxX: 1 }; // Default scale
    }
    
    // Calculate min/max with padding
    const values = data.map(d => d[yAxis]);
    const padding = (maxValue - minValue) * 0.1; // 10% padding
    const minY = Math.max(0, Math.min(...values) - padding);
    const maxY = Math.min(100, Math.max(...values) + padding);
    
    return { minY, maxY, minX: 0, maxX: data.length - 1 };
  };
  
  const scale = calculateScale();
  
  // Scale a value to SVG coordinates
  const scaleX = (value, index) => {
    if (data.length <= 1) return 200; // Center for single point
    return 40 + (index * (320 / (data.length - 1)));
  };
  
  const scaleY = (value) => {
    if (scale.maxY === scale.minY) return 90; // Middle if no range
    return 170 - ((value - scale.minY) / (scale.maxY - scale.minY)) * 160;
  };
  
  const generateAnimatedPath = () => {
    if (!data || data.length === 0) return "";
    
    let pathData = [];
    
    data.forEach((d, i) => {
      const x = scaleX(d[xAxis], i);
      const y = scaleY(d[yAxis]);
      pathData.push(`${x} ${y}`);
    });
    
    if (pathData.length === 0) return "";
    return `M ${pathData.join(' L ')}`;
  };
  
  const generateAreaPath = () => {
    if (!data || data.length === 0) return "";
    
    let pathData = [];
    
    data.forEach((d, i) => {
      const x = scaleX(d[xAxis], i);
      const y = scaleY(d[yAxis]);
      pathData.push(`${x} ${y}`);
    });
    
    if (pathData.length === 0) return "";
    
    // Close the area path
    const firstX = scaleX(data[0][xAxis], 0);
    const lastX = scaleX(data[data.length - 1][xAxis], data.length - 1);
    const bottomY = 170; // Bottom of chart
    
    return `M ${firstX} ${bottomY} L ${pathData.join(' L ')} L ${lastX} ${bottomY} Z`;
  };
  
  const getDataPointCoords = (d, i) => {
    return {
      x: scaleX(d[xAxis], i),
      y: scaleY(d[yAxis])
    };
  };
  
  // Reduce visual noise for large datasets
  const shouldShowPoint = (index) => {
    if (data.length <= 10) return true; // Show all points for small datasets
    return index % Math.ceil(data.length / 10) === 0; // Show ~10 points max
  };
  
  // Format Y-axis labels based on data type
  const formatYLabel = (value) => {
    if (yAxis.includes('Score') || yAxis.includes('Percentage')) {
      return `${value.toFixed(0)}%`;
    } else if (yAxis.includes('Time')) {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return minutes > 0 ? `${minutes}m${seconds}s` : `${seconds}s`;
    }
    return value.toFixed(0);
  };
  
  // Handle low-data cases gracefully
  const isEmptyData = !data || data.length === 0;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-80 relative group overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`line-gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line 
                key={i}
                x1="0" 
                y1={i * 40} 
                x2="400" 
                y2={i * 40} 
                stroke="#E5E7EB" 
                strokeWidth="0.5" 
              />
            ))}
            
            {/* Y-axis labels */}
            <text x="10" y="10" fontSize="10" fill="#6B7280">{formatYLabel(scale.maxY)}</text>
            <text x="10" y="50" fontSize="10" fill="#6B7280">{formatYLabel(scale.minY + (scale.maxY - scale.minY) * 0.75)}</text>
            <text x="10" y="90" fontSize="10" fill="#6B7280">{formatYLabel(scale.minY + (scale.maxY - scale.minY) * 0.5)}</text>
            <text x="10" y="130" fontSize="10" fill="#6B7280">{formatYLabel(scale.minY + (scale.maxY - scale.minY) * 0.25)}</text>
            <text x="10" y="170" fontSize="10" fill="#6B7280">{formatYLabel(scale.minY)}</text>
            
            {/* Animated Line chart */}
            {!isEmptyData && (
              <path 
                d={generateAnimatedPath()}
                fill="none" 
                stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* Animated Area under the line */}
            {!isEmptyData && (
              <path 
                d={generateAreaPath()}
                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                className="transition-all duration-1000 ease-out"
              />
            )}
            
            {/* Data points */}
            {!isEmptyData && data.map((point, index) => {
              const coords = getDataPointCoords(point, index);
              
              // Reduce visual noise - only show points for smaller datasets
              const shouldShow = shouldShowPoint(index);
              if (!shouldShow) return null;
              
              return (
                <g key={index}>
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="4"
                    fill="white"
                    stroke={`url(#line-gradient-${title.replace(/\s+/g, '-')})`}
                    strokeWidth="2"
                    className="transition-all duration-300 cursor-pointer hover:r-6"
                  />
                </g>
              );
            })}
            
            {/* X-axis labels */}
            {!isEmptyData && (
              <g>
                {data.map((point, index) => {
                  // Show fewer labels for large datasets
                  const showLabel = data.length <= 10 || index % Math.ceil(data.length / 5) === 0;
                  if (!showLabel) return null;
                  
                  const coords = getDataPointCoords(point, index);
                  return (
                    <text
                      key={index}
                      x={coords.x}
                      y="190"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                      className="transition-all duration-300 group-hover:fill-gray-900"
                    >
                      {(point[xAxis] || '').toString().substring(0, 5)}
                    </text>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLineChart;