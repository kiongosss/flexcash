/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e2139] p-4" style={{ fontFamily: "'Livvic', sans-serif" }}>
      <div className="bg-[#2c3252] p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-red-500">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">Something went wrong!</h1>
        <p className="text-gray-300 mb-8 text-lg">
          We&apos;re sorry, but there was an error processing your request.
        </p>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={reset}
            className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="mr-2">🔄</span>
            <span>TRY AGAIN</span>
          </button>
          
          <Link 
            href="/"
            className="py-3 px-6 bg-gray-700 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
