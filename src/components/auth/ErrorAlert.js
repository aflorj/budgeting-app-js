import React from 'react';
import { Trans } from 'react-i18next';

export default function ErrorAlert({ error }) {
  return (
    <div
      className="py-3 mt-2 px-5 bg-red-100 text-red-900 text-sm rounded-md border border-red-200 flex items-center justify-center"
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
            d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
          />
        </svg>
      </div>
      <span>
        <Trans>{error}</Trans>
      </span>
    </div>
  );
}
