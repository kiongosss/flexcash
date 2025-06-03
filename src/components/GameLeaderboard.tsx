/*
Project Name: Flexit
Project URI: 
Description: Modern game-style leaderboard component with dark theme
Version: 1.0
Author: KaseeMoka
Author URI: https://github.com/kiongosss
Text Domain: 
*/

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  avatar: string;
  points: number;
  prize: number;
  rank?: number;
  title?: string;
  timestamp?: string;
  message?: string;
}

const GameLeaderboard: React.FC = () => {
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  // Loading state removed
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('00d 00h 00m 00s');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(10);
  const [handle, setHandle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(50);
  const [totalUsers, setTotalUsers] = useState<number>(13868);
  // State for podium users
  const [podiumUsers, setPodiumUsers] = useState<User[]>([]);

  // We'll populate this with real data from the API
  const [topUsers, setTopUsers] = useState<User[]>([]);

  // Function to generate an avatar emoji based on the user's handle
  const getAvatarForUser = (handle: string): string => {
    // List of possible avatar emojis
    const avatars = [
      '👾', '🦖', '🚀', '⏱️', '🔥', '🎯', '🧠', '🌌', '💰', '🏍️', '🧙', '👤', 
      '👑', '💀', '🦍', '👽', '🤖', '👸', '🦊', '🐉', '🦁', '🐯', '🦈', '🦂', '🦚'
    ];
    
    // Use the handle string to deterministically select an avatar
    let sum = 0;
    for (let i = 0; i < handle.length; i++) {
      sum += handle.charCodeAt(i);
    }
    
    return avatars[sum % avatars.length];
  };
  
  // We'll only use real data from the API, no fallback or mock data

  // Reference to the scrolling container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle checkout process
  const handleCheckout = async () => {
    if (!handle.trim()) {
      alert('Please enter your social handle or website URL');
      return;
    }
    
    if (checkoutAmount < 1) {
      alert('Amount must be at least $1');
      return;
    }
    
    try {
      setIsCheckingOut(true);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle: handle.trim(),
          amount: checkoutAmount,
          message: message.trim(),
        }),
      });
      
      // Add try/catch for JSON parsing to handle empty or malformed responses
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
        data = {}; // Provide a default empty object
      }
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create checkout session');
      }
      
      // Redirect to checkout URL
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    // Fetch leaderboard data
    const fetchData = async () => {
      try {
        // Fetch real data from the API
        console.log('Fetching leaderboard data from API...');
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch leaderboard data');
        }
        
        console.log('Leaderboard data received:', data);
        
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          // Map the database users to the format expected by the component
          const mappedUsers = data.users.map((user: { id: string; handle: string; amountPaid: number; createdAt: string; message?: string }, index: number) => ({
            id: user.id,
            username: user.handle,
            avatar: getAvatarForUser(user.handle), // Generate avatar based on handle
            points: Math.floor(user.amountPaid * 10), // Convert amount to points
            prize: user.amountPaid,
            rank: index + 1,
            timestamp: user.createdAt,
            message: user.message || ''
          }));
          
          console.log('Mapped leaderboard users:', mappedUsers);
          
          // Update the leaderboard data with real users
          setLeaderboardData(mappedUsers);
          
          // Update the top users carousel with real users
          setTopUsers(mappedUsers.map((user: User, index: number) => ({
            ...user,
            title: `#${index + 1}`
          })));
          
          // Update total users count
          setTotalUsers(Math.max(10, data.users.length)); // Minimum of 10 for visual effect
          
          // If we have enough users, update the podium users
          if (mappedUsers.length >= 3) {
            // Update podium with top 3 users - ensure message field is included
            const newPodiumUsers = [
              { ...mappedUsers[1], rank: 2 },
              { ...mappedUsers[0], rank: 1 },
              { ...mappedUsers[2], rank: 3 }
            ];
            setPodiumUsers(newPodiumUsers);
            console.log('Set podium users with real data:', newPodiumUsers);
          } else if (mappedUsers.length === 2) {
            // Only 2 users
            const newPodiumUsers = [
              { ...mappedUsers[1], rank: 2 },
              { ...mappedUsers[0], rank: 1 },
              // Create an empty third position
              {
                id: 'empty-3',
                username: 'Your spot!',
                avatar: '❓',
                points: 0,
                prize: 0,
                rank: 3,
                message: 'This could be you!',
                timestamp: new Date().toISOString()
              }
            ];
            setPodiumUsers(newPodiumUsers);
          } else if (mappedUsers.length === 1) {
            // Only 1 user
            const newPodiumUsers = [
              // Create an empty second position
              {
                id: 'empty-2',
                username: 'Your spot!',
                avatar: '❓',
                points: 0,
                prize: 0,
                rank: 2,
                message: 'This could be you!',
                timestamp: new Date().toISOString()
              },
              { ...mappedUsers[0], rank: 1 },
              // Create an empty third position
              {
                id: 'empty-3',
                username: 'Your spot!',
                avatar: '❓',
                points: 0,
                prize: 0,
                rank: 3,
                message: 'This could be you!',
                timestamp: new Date().toISOString()
              }
            ];
            setPodiumUsers(newPodiumUsers);
          }
        } else {
          // If no users yet, show empty state
          console.log('No users found in database');
          setLeaderboardData([]);
          
          // Create empty podium
          const emptyPodium = [
            {
              id: 'empty-2',
              username: 'Your spot!',
              avatar: '❓',
              points: 0,
              prize: 0,
              rank: 2,
              message: 'Be the first to claim your spot!',
              timestamp: new Date().toISOString()
            },
            {
              id: 'empty-1',
              username: 'Top position',
              avatar: '👑',
              points: 0,
              prize: 0,
              rank: 1,
              message: 'Claim the throne!',
              timestamp: new Date().toISOString()
            },
            {
              id: 'empty-3',
              username: 'Your spot!',
              avatar: '❓',
              points: 0,
              prize: 0,
              rank: 3,
              message: 'Make your mark!',
              timestamp: new Date().toISOString()
            }
          ];
          setPodiumUsers(emptyPodium);
          setTopUsers([]);
        }
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data');
        // Fall back to mock data
        setLeaderboardData([...tableUsers]);
        setPodiumUsers(fallbackPodiumUsers);
      }
    };

    fetchData();

    // Countdown timer simulation
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1); // 1 day from now
    
    const updateTimer = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('00d 00h 00m 00s');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    };
    
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
    
    return () => clearInterval(timerInterval);
  }, []);

  // Auto-scrolling effect for the top users section
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    // Function to handle automatic scrolling
    const autoScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // If we've reached the end, reset to the beginning
      if (scrollPosition >= maxScroll) {
        setScrollPosition(0);
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise, scroll to the next item
        const newPosition = scrollPosition + 200; // Scroll by approximately one card width
        setScrollPosition(newPosition);
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
      }
    };
    
    // Set up the auto-scroll interval
    const scrollInterval = setInterval(autoScroll, 3000); // Scroll every 3 seconds
    
    return () => clearInterval(scrollInterval);
  }, [scrollPosition]);

  // Loading UI removed

  if (error) {
    return <div className="flex justify-center items-center h-96 text-red-500">{error}</div>;
  }

  // Helper function to format date as DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="bg-[#1e2139] text-white rounded-3xl overflow-hidden shadow-xl max-w-5xl mx-auto relative">
      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2c3252] p-6 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Claim Your Spot on the Leaderboard</h3>
              <button 
                onClick={() => setShowCheckoutForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="handle" className="block text-sm font-medium text-gray-300 mb-1">Your Social Handle or Website</label>
              <input 
                type="text" 
                id="handle" 
                value={handle} 
                onChange={(e) => setHandle(e.target.value)} 
                placeholder="@username or website.com"
                className="w-full px-4 py-2 bg-[#1e2139] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Your Flex Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message to display on the leaderboard"
                className="w-full px-4 py-2 bg-[#1e2139] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white h-20 resize-none"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount to Pay ($)</label>
              <div className="flex items-center">
                <span className="text-green-400 text-xl mr-2">$</span>
                <input 
                  type="number" 
                  id="amount" 
                  value={checkoutAmount} 
                  onChange={(e) => setCheckoutAmount(Math.max(1, Number(e.target.value)))} 
                  min="1"
                  className="w-full px-4 py-2 bg-[#1e2139] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum $1. Higher amounts get higher positions!</p>
            </div>
            
            <button 
              onClick={handleCheckout} 
              disabled={isCheckingOut} 
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isCheckingOut ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span className="mr-2">🔥</span>
                  <span>SUBMIT PAYMENT</span>
                  <span className="ml-2">🔥</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Project name and tagline */}
      <div className="text-center py-10">
        <h1 
          className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          style={{ fontFamily: "'Livvic', sans-serif", letterSpacing: "1px" }}
        >
          FLEXIT
        </h1>
        <p 
          className="text-2xl font-semibold text-gray-300 mt-3"
          style={{ fontFamily: "'Livvic', sans-serif" }}
        >
          Pay to flex on the leaderboard
        </p>
      </div>

      
      {/* Removed checkout section from here - will be shown as a modal */}
      
      {/* Podium section */}
      <div className="relative px-6 pt-10 pb-20 overflow-hidden">
        <div className="flex justify-center items-end space-x-4 mt-10">
          {/* Second place (left) */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-[#2c3252] to-[#1e2139] rounded-t-3xl pt-4 pb-10 px-8 w-64 flex flex-col items-center">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl mb-4 relative">
                <span className="text-4xl">{podiumUsers && podiumUsers.length > 0 ? podiumUsers[0].avatar : '🏆'}</span>
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">#2</div>
              </div>
              <h3 className="font-bold text-xl mb-1">{podiumUsers && podiumUsers.length > 0 ? podiumUsers[0].username : 'Player 2'}</h3>
              
              <div className="text-gray-300 mt-3 text-center text-sm italic">"{podiumUsers && podiumUsers.length > 0 && podiumUsers[0].message ? podiumUsers[0].message : 'Coming for the top spot!'}"</div>
              
              <div className="flex items-center mt-4">
                <span className="text-green-400 mr-2">$</span>
                <span className="font-bold text-xl">{podiumUsers && podiumUsers.length > 0 ? podiumUsers[0].prize.toFixed(2) : '199.99'}</span>
              </div>
              <div className="text-gray-400 text-xs">{podiumUsers && podiumUsers.length > 0 ? formatDate(podiumUsers[0].timestamp || '') : formatDate('')}</div>
            </div>
          </div>
        
          {/* First place (center) */}
          <div className="flex flex-col items-center -mt-10 z-10">
            <div className="bg-gradient-to-b from-[#2c3252] to-[#1e2139] rounded-t-3xl pt-4 pb-10 px-8 w-72 flex flex-col items-center">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-5 rounded-2xl mb-4 relative">
                <span className="text-4xl">{podiumUsers && podiumUsers.length > 1 ? podiumUsers[1].avatar : '👑'}</span>
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">#1</div>
              </div>
              <h3 className="text-xl font-bold mb-1 text-yellow-300">{podiumUsers && podiumUsers.length > 1 ? podiumUsers[1].username : 'Champion'}</h3>
              <p className="text-gray-300 text-sm italic mb-2">"{podiumUsers && podiumUsers.length > 1 && podiumUsers[1].message ? podiumUsers[1].message : 'Top player in the world!'}"</p>
              
              <div className="flex items-center mt-4">
                <span className="text-green-400 mr-2">$</span>
                <span className="font-bold text-xl text-yellow-300">{podiumUsers && podiumUsers.length > 1 ? podiumUsers[1].prize.toFixed(2) : '499.99'}</span>
              </div>
              <div className="text-gray-400 text-xs">
                {podiumUsers && podiumUsers.length > 1 && podiumUsers[1].timestamp ? formatDate(podiumUsers[1].timestamp) : formatDate('')}
              </div>
            </div>
          </div>
          
          {/* Third place (right) */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-[#2c3252] to-[#1e2139] rounded-t-3xl pt-4 pb-8 px-8 w-64 flex flex-col items-center">
              <div className="bg-gradient-to-br from-gray-200 to-gray-500 p-4 rounded-2xl mb-4 relative">
                <span className="text-4xl">{podiumUsers && podiumUsers.length > 2 ? podiumUsers[2].avatar : '🦍'}</span>
                <div className="absolute -top-3 -right-3 bg-gray-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">#3</div>
              </div>
              <h3 className="font-bold text-xl mb-1">{podiumUsers && podiumUsers.length > 2 ? podiumUsers[2].username : 'Challenger'}</h3>
              
              <div className="text-gray-300 mt-3 text-center text-sm italic">"{podiumUsers && podiumUsers.length > 2 && podiumUsers[2].message ? podiumUsers[2].message : 'Coming for the crown!'}"</div>
              
              <div className="flex items-center mt-4">
                <span className="text-green-400 mr-2">$</span>
                <span className="font-bold text-xl">{podiumUsers && podiumUsers.length > 2 ? podiumUsers[2].prize.toFixed(2) : '99.99'}</span>
              </div>
              <div className="text-gray-400 text-xs">{podiumUsers && podiumUsers.length > 2 ? formatDate(podiumUsers[2].timestamp || '') : formatDate('')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CLAIM SPOT NOW button */}
      <div className="flex justify-center my-8">
        <button 
          onClick={() => setShowCheckoutForm(true)} 
          className="py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
        >
          <span className="mr-2">🔥</span>
          <span>CLAIM SPOT NOW</span>
          <span className="ml-2">🔥</span>
        </button>
      </div>
      
      {/* Leaderboard table */}
      <div className="px-4 pb-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="py-2 px-4">Place</th>
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">Message</th>
              <th className="py-2 px-4 text-right">Prize</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user: User) => (
              <tr key={user.id} className="border-b border-[#2c3252]">
                <td className="py-3 px-4">
                  <div className="bg-[#2c3252] rounded-lg px-2 py-1 inline-flex items-center">
                    <span className="text-yellow-400 mr-1">🏆</span> {user.rank}
                  </div>
                </td>
                <td className="py-3 px-4 font-bold">{user.username}</td>
                <td className="py-3 px-4 text-gray-300 italic text-sm">{user.message}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="inline-flex items-center">
                      <span className="text-green-400 mr-1">$</span>
                      <span className="font-bold">{user.prize.toFixed(2)}</span>
                    </div>
                    {user.timestamp && (
                      <div className="text-gray-500 text-xs mt-1">
                        {formatDate(user.timestamp)}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer button */}
      <div className="pb-6 flex justify-center">
        <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2">
          <span className="text-xl">🔄</span>
        </button>
      </div>
    </div>
  );
};

export default GameLeaderboard;
