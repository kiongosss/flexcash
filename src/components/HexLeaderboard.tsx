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
  rank?: number;
};

type FilterPeriod = 'weekly' | 'monthly';

export default function HexLeaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('monthly');

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        
        // Add placeholder avatar URLs if not provided and assign ranks
        const usersWithDetails = data.users.map((user: User, index: number) => ({
          ...user,
          avatarUrl: user.avatarUrl || `/avatars/avatar-${(index % 5) + 1}.png`,
          rank: index + 1
        }));
        
        setUsers(usersWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Format amount to USD currency with cents
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-yellow-400 hover:text-yellow-300"
        >
          Try again
        </button>
      </div>
    );
  }
  
  // Mock data if no users are available
  if (users.length === 0) {
    const mockUsers = [
      { id: '1', handle: 'KingSize', amountPaid: 21573.98, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-1.png', rank: 1 },
      { id: '2', handle: 'KingSize', amountPaid: 17702.11, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-2.png', rank: 2 },
      { id: '3', handle: 'KingSize', amountPaid: 3862.10, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-3.png', rank: 3 },
      { id: '4', handle: 'Floyd Miles', amountPaid: 3862.10, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-4.png', rank: 4 },
      { id: '5', handle: 'Dianne Russell', amountPaid: 2171.72, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-5.png', rank: 5 },
      { id: '6', handle: 'Cameron Williamson', amountPaid: 2096.06, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-1.png', rank: 6 },
      { id: '7', handle: 'Jenny Wilson', amountPaid: 1792.98, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-2.png', rank: 7 },
      { id: '8', handle: 'Courtney Henry', amountPaid: 1703.21, createdAt: new Date().toISOString(), avatarUrl: '/avatars/avatar-3.png', rank: 8 },
    ];
    setUsers(mockUsers);
  }

  // Get top 3 users for podium
  const topThree = users.slice(0, 3);
  // Get users ranked 4th and below
  const otherUsers = users.slice(3, 10);
  
  return (
    <div className="bg-[#1e1e24] text-white rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-orange-500">🏆</span>
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>
        <div className="flex space-x-2 bg-gray-800 rounded-full p-1">
          <button 
            onClick={() => setFilterPeriod('monthly')}
            className={`px-4 py-1 text-sm rounded-full transition-colors ${filterPeriod === 'monthly' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setFilterPeriod('weekly')}
            className={`px-4 py-1 text-sm rounded-full transition-colors ${filterPeriod === 'weekly' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Laurel wreath decorations */}
      <div className="absolute top-32 left-8 h-64 w-32 opacity-70 pointer-events-none">
        <Image 
          src="/laurel-left.svg" 
          alt="Laurel wreath left"
          width={128}
          height={256}
          className="object-contain"
        />
      </div>
      <div className="absolute top-32 right-8 h-64 w-32 opacity-70 pointer-events-none">
        <Image 
          src="/laurel-right.svg" 
          alt="Laurel wreath right"
          width={128}
          height={256}
          className="object-contain"
        />
      </div>

      {/* Top 3 Podium Section */}
      <div className="relative p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-b from-[#1e1e24] to-[#1a1a20]">
        {/* Second Place */}
        <div className="flex flex-col items-center order-2 md:order-1">
          <div className="relative mb-4">
            <div className="absolute -top-2 -right-2">
              <span className="bg-[#1e1e24] text-white text-xs px-2 py-1 rounded-full">#2</span>
            </div>
            <div className="hexagon-container">
              <div className="hexagon">
                <Image 
                  src={topThree[1]?.avatarUrl || "/avatars/avatar-2.png"} 
                  alt={topThree[1]?.handle || "Second place"}
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <p className="text-lg font-medium">{topThree[1]?.handle || "KingSize"}</p>
          <p className="text-orange-500 font-bold text-xl">
            {topThree[1] ? formatCurrency(topThree[1].amountPaid) : "$17,702.11"}
          </p>
          <div className="mt-4 bg-[#2a2a30] rounded-lg p-3 w-full text-center">
            <p className="text-sm text-gray-400">Prize</p>
            <p className="text-orange-500 font-bold">$20,000</p>
          </div>
        </div>
        
        {/* First Place */}
        <div className="flex flex-col items-center order-1 md:order-2">
          <div className="relative mb-4">
            <div className="absolute -top-2 -right-2 z-10">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">#1</span>
            </div>
            <div className="hexagon-container scale-125">
              <div className="hexagon">
                <Image 
                  src={topThree[0]?.avatarUrl || "/avatars/avatar-1.png"} 
                  alt={topThree[0]?.handle || "First place"}
                  width={120}
                  height={120}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <p className="text-lg font-medium">{topThree[0]?.handle || "KingSize"}</p>
          <p className="text-orange-500 font-bold text-xl">
            {topThree[0] ? formatCurrency(topThree[0].amountPaid) : "$21,573.98"}
          </p>
          <div className="mt-4 bg-[#2a2a30] rounded-lg p-3 w-full text-center">
            <p className="text-sm text-gray-400">Prize</p>
            <p className="text-orange-500 font-bold">$20,000</p>
          </div>
        </div>
        
        {/* Third Place */}
        <div className="flex flex-col items-center order-3">
          <div className="relative mb-4">
            <div className="absolute -top-2 -right-2">
              <span className="bg-[#1e1e24] text-white text-xs px-2 py-1 rounded-full">#3</span>
            </div>
            <div className="hexagon-container">
              <div className="hexagon">
                <Image 
                  src={topThree[2]?.avatarUrl || "/avatars/avatar-3.png"} 
                  alt={topThree[2]?.handle || "Third place"}
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <p className="text-lg font-medium">{topThree[2]?.handle || "KingSize"}</p>
          <p className="text-orange-500 font-bold text-xl">
            {topThree[2] ? formatCurrency(topThree[2].amountPaid) : "$3,862.10"}
          </p>
          <div className="mt-4 bg-[#2a2a30] rounded-lg p-3 w-full text-center">
            <p className="text-sm text-gray-400">Prize</p>
            <p className="text-orange-500 font-bold">$20,000</p>
          </div>
        </div>
      </div>

      {/* List of other users */}
      <div className="divide-y divide-gray-800">
        {otherUsers.length > 0 ? (
          otherUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-[#2a2a30] transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 w-8 text-right">
                  <span>#{user.rank}</span>
                </div>
                <div className="hexagon-container-small">
                  <div className="hexagon-small">
                    <Image 
                      src={user.avatarUrl || "/avatars/default.png"} 
                      alt={user.handle}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{user.handle}</p>
                </div>
              </div>
              <div>
                <p className="text-orange-500 font-bold">{formatCurrency(user.amountPaid)}</p>
              </div>
            </div>
          ))
        ) : (
          // Mock data for positions 4-8
          [
            { id: '4', handle: 'Floyd Miles', amountPaid: 3862.10, rank: 4 },
            { id: '5', handle: 'Dianne Russell', amountPaid: 2171.72, rank: 5 },
            { id: '6', handle: 'Cameron Williamson', amountPaid: 2096.06, rank: 6 },
            { id: '7', handle: 'Jenny Wilson', amountPaid: 1792.98, rank: 7 },
            { id: '8', handle: 'Courtney Henry', amountPaid: 1703.21, rank: 8 }
          ].map((mockUser) => (
            <div key={mockUser.id} className="flex items-center justify-between p-4 hover:bg-[#2a2a30] transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 w-8 text-right">
                  <span>#{mockUser.rank}</span>
                </div>
                <div className="hexagon-container-small">
                  <div className="hexagon-small">
                    <Image 
                      src={`/avatars/avatar-${(mockUser.rank % 5) + 1}.png`}
                      alt={mockUser.handle}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{mockUser.handle}</p>
                </div>
              </div>
              <div>
                <p className="text-orange-500 font-bold">{formatCurrency(mockUser.amountPaid)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
