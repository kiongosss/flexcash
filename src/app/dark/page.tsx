/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Version: 1.0.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import DarkLeaderboard from '@/components/DarkLeaderboard';
import { Suspense } from 'react';

export default function DarkPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Suspense fallback={<div className="animate-pulse bg-gray-800 h-96 mt-6 rounded-lg"></div>}>
          <DarkLeaderboard />
        </Suspense>
      </div>
    </main>
  );
}
