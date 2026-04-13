import React from 'react';

const Spinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;
