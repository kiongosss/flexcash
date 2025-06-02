/*
Project Name: Flexit
Project URI: 
Description: A web app where users pay to flex on a public leaderboard
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

import { Suspense } from 'react';
import GameLeaderboard from '@/components/GameLeaderboard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600">
      <div className="container max-w-6xl mx-auto">
        <GameLeaderboard />
      </div>
    </main>
  );
}
