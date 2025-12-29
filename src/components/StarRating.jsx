import React from 'react';

const StarRating = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${index < rating ? 'text-amber-400' : 'text-gray-300'} transition-colors duration-200`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5L12.1 7.5H19.5L13.8 11.7L16 18.5L10 14L4 18.5L6.2 11.7L.5 7.5H7.9L10 .5Z" fillRule="evenodd" clipRule="evenodd" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-medium text-gray-600">{rating}/{maxRating}</span>
    </div>
  );
};

export default StarRating;