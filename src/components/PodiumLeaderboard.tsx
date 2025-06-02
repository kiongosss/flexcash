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
import Link from 'next/link';

// Define the User type based on our Prisma schema
type User = {
  id: string;
  handle: string;
  amountPaid: number;
  createdAt: string;
  avatarUrl?: string; // For user avatars
  rank?: number;
};

// Avatar color map for consistent colors
const avatarColors = [
  { bg: '#FFD700', text: '#000000' }, // Gold
  { bg: '#C0C0C0', text: '#000000' }, // Silver
  { bg: '#CD7F32', text: '#000000' }, // Bronze
  { bg: '#4169E1', text: '#FFFFFF' }, // Royal Blue
  { bg: '#FF4500', text: '#FFFFFF' }, // Orange Red
  { bg: '#2E8B57', text: '#FFFFFF' }, // Sea Green
  { bg: '#8A2BE2', text: '#FFFFFF' }, // Blue Violet
  { bg: '#DC143C', text: '#FFFFFF' }, // Crimson
  { bg: '#20B2AA', text: '#000000' }, // Light Sea Green
  { bg: '#FF8C00', text: '#000000' }, // Dark Orange
];

export default function PodiumLeaderboard() {
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
        
        // Add ranks to users
        const usersWithDetails = data.users.map((user: User, index: number) => ({
          ...user,
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

  // Generate avatar with initials
  const getAvatarElement = (user: User, size: number = 24) => {
    const index = (user.rank ? user.rank - 1 : 0) % avatarColors.length;
    const color = avatarColors[index];
    const initials = user.handle.charAt(0).toUpperCase();
    
    return (
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color.bg,
          color: color.text,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size / 2}px`,
          fontWeight: 'bold'
        }}
      >
        {initials}
      </div>
    );
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
      { id: '1', handle: 'Mike', amountPaid: 120000.00, createdAt: new Date().toISOString(), rank: 1 },
      { id: '2', handle: 'Jolie', amountPaid: 50000.00, createdAt: new Date().toISOString(), rank: 2 },
      { id: '3', handle: 'Jake', amountPaid: 30000.00, createdAt: new Date().toISOString(), rank: 3 },
      { id: '4', handle: 'Floyd Miles', amountPaid: 3862.10, createdAt: new Date().toISOString(), rank: 4 },
      { id: '5', handle: 'Dianne Russell', amountPaid: 2171.72, createdAt: new Date().toISOString(), rank: 5 },
    ];
    setUsers(mockUsers);
  }

  // Get top 3 users for podium
  const topThree = users.slice(0, 3);
  // Get users ranked 4th and below
  const otherUsers = users.slice(3, 10);
  
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500">💰</span>
          <h2 className="text-xl font-bold">Flexit</h2>
        </div>
        <div>
          <p className="text-sm text-gray-400 italic">Spend to trend. Rule the board.</p>
        </div>
      </div>

      {/* Podium Section - Dark Background with Circular Avatars */}
      <div className="relative p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gradient-to-b from-gray-900 to-black">
        {/* Laurel wreaths removed as requested */}
        {/* Second Place */}
        <div className="flex flex-col items-center order-2 md:order-1 bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <div className="relative mb-4">
            <div className="absolute -top-2 -right-2 z-10">
              <span className="text-gray-300 text-xl">👑</span>
            </div>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-500 flex items-center justify-center">
              {topThree[1] ? getAvatarElement(topThree[1], 96) : (
                <div style={{ width: '96px', height: '96px', backgroundColor: '#C0C0C0', color: '#000000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold' }}>J</div>
              )}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium border-b border-gray-700 pb-2 mb-2">{topThree[1]?.handle || "Jolie"}</h3>
            <p className="text-yellow-400 font-bold text-xl">
              {topThree[1] ? formatCurrency(topThree[1].amountPaid) : "$50,000.00"}
            </p>
            <div className="mt-2 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full">
              2
            </div>
          </div>
        </div>
        
        {/* First Place */}
        <div className="flex flex-col items-center order-1 md:order-2 bg-gray-800 bg-opacity-50 rounded-lg p-4 transform md:scale-110 z-10">
          <div className="relative mb-4">
            <div className="absolute -top-4 -right-2 z-10">
              <span className="text-yellow-400 text-2xl">👑</span>
            </div>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 flex items-center justify-center">
              {topThree[0] ? getAvatarElement(topThree[0], 128) : (
                <div style={{ width: '128px', height: '128px', backgroundColor: '#FFD700', color: '#000000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', fontWeight: 'bold' }}>M</div>
              )}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-medium border-b border-gray-700 pb-2 mb-2">{topThree[0]?.handle || "Mike"}</h3>
            <p className="text-yellow-400 font-bold text-2xl">
              {topThree[0] ? formatCurrency(topThree[0].amountPaid) : "$120,000.00"}
            </p>
            <div className="mt-2 bg-yellow-500 text-black text-sm font-bold px-4 py-1 rounded-full">
              1
            </div>
          </div>
        </div>
        
        {/* Third Place */}
        <div className="flex flex-col items-center order-3 bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <div className="relative mb-4">
            <div className="absolute -top-2 -right-2 z-10">
              <span className="text-yellow-700 text-xl">👑</span>
            </div>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-700 flex items-center justify-center">
              {topThree[2] ? getAvatarElement(topThree[2], 96) : (
                <div style={{ width: '96px', height: '96px', backgroundColor: '#CD7F32', color: '#000000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold' }}>J</div>
              )}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium border-b border-gray-700 pb-2 mb-2">{topThree[2]?.handle || "Jake"}</h3>
            <p className="text-yellow-400 font-bold text-xl">
              {topThree[2] ? formatCurrency(topThree[2].amountPaid) : "$30,000.00"}
            </p>
            <div className="mt-2 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full">
              3
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center my-6">
        <Link 
          href="/checkout" 
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transform transition-transform hover:scale-105 shadow-lg"
        >
          CLAIM SPOT NOW
        </Link>
      </div>

      {/* List of other users */}
      <div className="divide-y divide-gray-800">
        {otherUsers.length > 0 ? (
          otherUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 w-8 text-right">
                  <span>#{user.rank}</span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                  {getAvatarElement(user, 40)}
                </div>
                <div>
                  <p className="font-medium">{user.handle}</p>
                </div>
              </div>
              <div>
                <p className="text-yellow-400 font-bold">{formatCurrency(user.amountPaid)}</p>
              </div>
            </div>
          ))
        ) : (
          // Mock data for positions 4-5
          [
            { id: '4', handle: 'Floyd Miles', amountPaid: 3862.10, rank: 4 },
            { id: '5', handle: 'Dianne Russell', amountPaid: 2171.72, rank: 5 }
          ].map((mockUser) => (
            <div key={mockUser.id} className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 w-8 text-right">
                  <span>#{mockUser.rank}</span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: avatarColors[(mockUser.rank - 1) % avatarColors.length].bg,
                    color: avatarColors[(mockUser.rank - 1) % avatarColors.length].text,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {mockUser.handle.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{mockUser.handle}</p>
                </div>
              </div>
              <div>
                <p className="text-yellow-400 font-bold">{formatCurrency(mockUser.amountPaid)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
