import React from 'react';

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
    <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/3"></div>
      <div className="h-9 bg-gray-200 rounded-xl w-full mt-2"></div>
    </div>
  </div>
);

const LoadingSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export default LoadingSkeleton;
