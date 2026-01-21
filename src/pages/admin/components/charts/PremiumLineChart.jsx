import React, { useState } from 'react';

const PremiumLineChart = ({ dataPoints, maxValue, minValue, onPointHover, onPointLeave }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const handlePointHover = (point, index) => {
    setHoveredPoint({ point, index });
    if (onPointHover) onPointHover(point, index);
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
    if (onPointLeave) onPointLeave();
  };

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="h-80 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y, i) => (
            <line 
              key={i}
              x1="0" 
              y1={y} 
              x2="100" 
              y2={y} 
              stroke="#E5E7EB" 
              strokeWidth="0.2" 
            />
          ))}
          
          {/* Y-axis labels */}
          <text x="2" y="5" fontSize="2.5" fill="#6B7280">0</text>
          <text x="2" y="25" fontSize="2.5" fill="#6B7280">25</text>
          <text x="2" y="50" fontSize="2.5" fill="#6B7280">50</text>
          <text x="2" y="75" fontSize="2.5" fill="#6B7280">75</text>
          <text x="2" y="95" fontSize="2.5" fill="#6B7280">100</text>
        </svg>
      </div>
    );
  }

  // Generate animated path for the chart with dynamic scaling
  const generateAnimatedPath = () => {
    if (dataPoints.length === 0) return "";
    
    let path = `M 0 ${100 - ((dataPoints[0].value - minValue) / (maxValue - minValue)) * 90} `;
    
    for (let i = 1; i < dataPoints.length; i++) {
      const x = (i / (dataPoints.length - 1)) * 100;
      const y = 100 - ((dataPoints[i].value - minValue) / (maxValue - minValue)) * 90;
      path += `L ${x} ${y} `;
    }
    
    return path;
  };

  // Generate area path for the chart with dynamic scaling
  const generateAreaPath = () => {
    if (dataPoints.length === 0) return "";
    
    let path = `M 0 ${100 - ((dataPoints[0].value - minValue) / (maxValue - minValue)) * 90} `;
    
    for (let i = 1; i < dataPoints.length; i++) {
      const x = (i / (dataPoints.length - 1)) * 100;
      const y = 100 - ((dataPoints[i].value - minValue) / (maxValue - minValue)) * 90;
      path += `L ${x} ${y} `;
    }
    
    // Close the area path
    path += `L 100 100 L 0 100 Z`;
    
    return path;
  };

  return (
    <div className="h-80 relative overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y, i) => (
          <line 
            key={i}
            x1="0" 
            y1={y} 
            x2="100" 
            y2={y} 
            stroke="#E5E7EB" 
            strokeWidth="0.2" 
          />
        ))}
        
        {/* Y-axis labels */}
        <text x="2" y="5" fontSize="2.5" fill="#6B7280">{Math.round(maxValue)}</text>
        <text x="2" y="25" fontSize="2.5" fill="#6B7280">{Math.round(minValue + (maxValue - minValue) * 0.75)}</text>
        <text x="2" y="50" fontSize="2.5" fill="#6B7280">{Math.round(minValue + (maxValue - minValue) * 0.5)}</text>
        <text x="2" y="75" fontSize="2.5" fill="#6B7280">{Math.round(minValue + (maxValue - minValue) * 0.25)}</text>
        <text x="2" y="95" fontSize="2.5" fill="#6B7280">{Math.round(minValue)}</text>
        
        {/* Animated Area */}
        <path
          d={generateAreaPath()}
          fill="url(#areaGradient)"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Animated Line */}
        <path
          d={generateAnimatedPath()}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm transition-all duration-1000 ease-out"
        />
        
        {/* Data points */}
        {dataPoints.map((point, i) => {
          const x = (i / (dataPoints.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / (maxValue - minValue)) * 90;
          
          // Reduce visual noise - only show points for smaller datasets
          const shouldShowPoint = dataPoints.length <= 10 || i % Math.ceil(dataPoints.length / 10) === 0;
          if (!shouldShowPoint) return null;
          
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="1.5"
                fill="#3B82F6"
                className="cursor-pointer hover:r-2 transition-all"
                onMouseEnter={() => handlePointHover(point, i)}
                onMouseLeave={handlePointLeave}
              />
              
              {/* Tooltip */}
              {hoveredPoint && hoveredPoint.index === i && (
                <g>
                  <rect 
                    x={x - 15} 
                    y={y - 15} 
                    width="30" 
                    height="15" 
                    rx="2" 
                    fill="#1F2937" 
                  />
                  <text 
                    x={x} 
                    y={y - 5} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="2.5" 
                    fontWeight="bold"
                  >
                    {Math.round(point.value)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* X-axis labels - Clean */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {dataPoints.map((point, index) => (
          <div key={index} className="text-[10px] text-gray-500 transform -translate-x-1/2 whitespace-nowrap" style={{ marginLeft: `${(index / (dataPoints.length - 1)) * 100}%` }}>
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumLineChart;