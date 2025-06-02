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

import { useState, useEffect } from 'react';
import LeaderboardStats from './LeaderboardStats';

type User = {
  id: string;
  handle: string;
  amountPaid: number;
  createdAt: string;
};

export default function LeaderboardStatsWrapper() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard stats:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse mb-6">
        <div className="bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  return <LeaderboardStats users={users} />;
}
