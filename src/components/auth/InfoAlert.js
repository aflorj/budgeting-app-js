import React from 'react';

export default function InfoAlert({ error }) {
  return (
    <div
      className="py-3 mt-2 px-5 bg-purple-100 text-purple-900 text-sm rounded-md border border-purple-200 flex items-center justify-center"
      role="alert"
    >
      <div className="w-4 mr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <span>{error}</span>
    </div>
  );
}
