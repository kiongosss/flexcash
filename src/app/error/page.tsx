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
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('type') || 'unknown';
  
  const errorMessages = {
    'checkout_failed': 'Your payment could not be processed. Please try again.',
    'invalid_parameters': 'Invalid request parameters. Please try again with valid information.',
    'invalid_amount': 'Please enter a valid amount (minimum $1).',
    'unknown': 'An unknown error occurred. Please try again.',
  };
  
  const errorMessage = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.unknown;
  
  // Log error information for debugging
  useEffect(() => {
    console.error('Payment error:', { errorType, errorMessage });
  }, [errorType, errorMessage]);
  
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
        
        <h1 className="text-3xl font-bold text-white mb-3">Payment Failed</h1>
        <p className="text-gray-300 mb-8 text-lg">
          {errorMessage}
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/"
            className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="mr-2">🔥</span>
            <span>TRY AGAIN</span>
            <span className="ml-2">🔥</span>
          </Link>
          
          <p className="text-xs text-gray-400 mt-4">
            Error code: {errorType}
          </p>
        </div>
      </div>
    </div>
  );
}

// Fallback component to show while the error content is loading
function ErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e2139] p-4" style={{ fontFamily: "'Livvic', sans-serif" }}>
      <div className="bg-[#2c3252] p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-red-500">
        <h1 className="text-3xl font-bold text-white mb-3">Loading Error Details...</h1>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/"
            className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorFallback />}>
      <ErrorContent />
    </Suspense>
  );
}
