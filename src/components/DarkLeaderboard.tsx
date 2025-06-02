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
import Image from 'next/image';

// Define the User type based on our Prisma schema
type User = {
  id: string;
  handle: string;
  amountPaid: number;
  createdAt: string;
  avatarUrl?: string; // For user avatars
};

export default function DarkLeaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        
        // Add placeholder avatar URLs if not provided
        const usersWithAvatars = data.users.map((user: User, index: number) => ({
          ...user,
          avatarUrl: user.avatarUrl || `/avatars/avatar-${(index % 5) + 1}.png`
        }));
        
        setUsers(usersWithAvatars);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Format amount to USD currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-green-400 hover:text-green-300"
        >
          Try again
        </button>
      </div>
    );
  }
  
  // Mock data if no users are available
  if (users.length === 0) {
    const mockUsers = [
      { id: '1', handle: 'mollitommy', amountPaid: 500, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-1.png' },
      { id: '2', handle: 'jefryjerry', amountPaid: 300, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-2.png' },
      { id: '3', handle: 'kolitrume', amountPaid: 200, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-3.png' },
      { id: '4', handle: 'meraty', amountPaid: 100, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-4.png' },
      { id: '5', handle: 'faueod', amountPaid: 50, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-5.png' },
      { id: '6', handle: 'jikolim', amountPaid: 25, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-1.png' },
    ];
    setUsers(mockUsers);
  }

  // Get top 3 users for podium
  const topThree = users.slice(0, 3);
  // Get users ranked 4th and below
  const otherUsers = users.slice(3, 10);
  
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <div className="flex space-x-3">
          <button className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Podium Section */}
      <div className="relative p-6 flex justify-center items-end space-x-4 h-80 bg-black">
        {/* Second Place */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-2">
            <div className="absolute -top-6 -right-2">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">🥈</span>
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-400">
              <Image 
                src={topThree[1]?.avatarUrl || "/avatars/avatar-2.png"} 
                alt={topThree[1]?.handle || "Second place"}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-sm font-medium">{topThree[1]?.handle || "jefryjerry"}</p>
          <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mt-1">
            {topThree[1] ? formatCurrency(topThree[1].amountPaid) : "$300"}
          </div>
          <div className="bg-gray-800 h-24 w-20 mt-2 rounded-t-lg flex items-end justify-center">
            <span className="mb-2 text-2xl text-gray-400">2</span>
          </div>
        </div>
        
        {/* First Place */}
        <div className="flex flex-col items-center mb-10 z-10">
          <div className="relative mb-2">
            <div className="absolute -top-6 -right-2">
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">🏆</span>
            </div>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-400">
              <Image 
                src={topThree[0]?.avatarUrl || "/avatars/avatar-1.png"} 
                alt={topThree[0]?.handle || "First place"}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-sm font-medium">{topThree[0]?.handle || "mollitommy"}</p>
          <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mt-1">
            {topThree[0] ? formatCurrency(topThree[0].amountPaid) : "$500"}
          </div>
          <div className="bg-gray-800 h-32 w-24 mt-2 rounded-t-lg flex items-end justify-center">
            <span className="mb-2 text-3xl text-gray-400">1</span>
          </div>
        </div>
        
        {/* Third Place */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-2">
            <div className="absolute -top-6 -right-2">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">🥉</span>
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-400">
              <Image 
                src={topThree[2]?.avatarUrl || "/avatars/avatar-3.png"} 
                alt={topThree[2]?.handle || "Third place"}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-sm font-medium">{topThree[2]?.handle || "kolitrume"}</p>
          <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mt-1">
            {topThree[2] ? formatCurrency(topThree[2].amountPaid) : "$200"}
          </div>
          <div className="bg-gray-800 h-16 w-20 mt-2 rounded-t-lg flex items-end justify-center">
            <span className="mb-2 text-2xl text-gray-400">3</span>
          </div>
        </div>
      </div>

      {/* List of other users */}
      <div className="divide-y divide-gray-800">
        {otherUsers.length > 0 ? (
          otherUsers.map((user, index) => {
            // Calculate percentage increase from previous user
            const percentIncrease = index > 0 && otherUsers[index-1].amountPaid > 0 
              ? ((user.amountPaid - otherUsers[index-1].amountPaid) / otherUsers[index-1].amountPaid) * 100
              : 0;
            
            return (
              <div key={user.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400 w-6 text-center">
                    <span className="inline-flex items-center justify-center">
                      🏅 {index + 4}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image 
                      src={user.avatarUrl || "/avatars/default.png"} 
                      alt={user.handle}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{user.handle}</p>
                    <p className="text-xs text-gray-500">@{user.handle.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-yellow-400">
                    <span className="inline-flex items-center">
                      ⭐ {Math.round(user.amountPaid / 5)}
                    </span>
                  </div>
                  {percentIncrease > 0 && (
                    <div className="text-green-400 text-sm">
                      +{percentIncrease.toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          // Mock data for positions 4-6
          [
            { id: '4', handle: 'Theresa Webb', username: 'meraty', amountPaid: 100, stars: 100, percent: 92.02 },
            { id: '5', handle: 'Kathryn Murphy', username: 'faueod', amountPaid: 50, stars: 50, percent: 88.01 },
            { id: '6', handle: 'Jane Cooper', username: 'jikolim', amountPaid: 25, stars: 25, percent: 73.56 }
          ].map((mockUser, index) => (
            <div key={mockUser.id} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 w-6 text-center">
                  <span className="inline-flex items-center justify-center">
                    🏅 {index + 4}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image 
                    src={`/avatars/avatar-${(index % 5) + 1}.png`}
                    alt={mockUser.handle}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{mockUser.handle}</p>
                  <p className="text-xs text-gray-500">@{mockUser.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-yellow-400">
                  <span className="inline-flex items-center">
                    ⭐ {mockUser.stars}
                  </span>
                </div>
                <div className="text-green-400 text-sm">
                  +{mockUser.percent}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
