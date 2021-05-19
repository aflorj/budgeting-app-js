import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage({ content }) {
  return (
    <div className="bg-gray-200 h-screen w-full flex flex-col md:flex-row">
      <div className="md:hidden bg-green-200 w-full border-b-2 rounded-b-lg border-green-300">
        {content}
      </div>
      <div className="w-full">content</div>
      <div className="bg-gray-100 md:w-1/3 hidden flex-col shadow-2xl lg:mr-12 justify-center px-8 md:flex">
        {content}
      </div>
    </div>
  );
}
