/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Congratulations! You've successfully claimed your spot on the leaderboard.
        </p>
        
        <div className="bg-indigo-50 p-4 rounded-md mb-6">
          <p className="text-indigo-700 font-medium">
            Your position on the leaderboard depends on your payment amount. The more you paid, the higher your ranking!
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-block bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
