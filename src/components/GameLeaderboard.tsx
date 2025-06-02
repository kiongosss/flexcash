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
  
  // State to track if we should show the podium section
  const [showPodium, setShowPodium] = useState<boolean>(false);

  // Generate avatar based on handle
  const getAvatarForUser = (handle: string): string => {
    // Simple emoji avatar generation based on the first character of the handle
    const emojiOptions = ['🦊', '🐱', '🐶', '🦁', '🐯', '🐺', '🦄', '🐼', '🐨', '🐵', '🐸', '🐙', '🦋', '🦂', '🦜'];
    const charCode = handle.charCodeAt(0) || 0;
    return emojiOptions[charCode % emojiOptions.length];
  };
  
  // Reference to the scrolling container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle checkout process
  const handleCheckout = async () => {
    if (!handle.trim()) {
      alert('Please enter your handle');
      return;
    }

    try {
      setIsCheckingOut(true);
      
      // For local development, we'll use the mock checkout endpoint
      const response = await fetch('/api/mock-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle,
          message,
          amount: checkoutAmount,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }
      
      // In production, we would redirect to Lemon Squeezy checkout URL
      // window.location.href = data.checkoutUrl;
      
      // For local development, we'll just simulate a successful checkout
      console.log('Mock checkout successful:', data);
      
      // Close the checkout form
      setShowCheckoutForm(false);
      
      // Refresh the leaderboard data
      fetchData();
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
          
          // Apply the new podium logic: 
          // - Position #1 (center) always shows the top-paying user
          // - Positions #2 and #3 only show users who paid $10 or more
          // - If there aren't enough qualifying users, those positions show placeholder cards
          
          // Always have the top-paying user in position #1 (center)
          const topUser = mappedUsers[0];
          
          // Filter users who paid $10 or more (excluding the top user who's already in position #1)
          const qualifyingUsers = mappedUsers.slice(1).filter((user: User) => user.prize >= 10);
          console.log('Users who paid $10 or more (excluding top user):', qualifyingUsers);
          
          // Prepare the podium array
          const newPodiumUsers: User[] = [];
          
          // Position #2 (left) - Only show if there's a qualifying user
          if (qualifyingUsers.length > 0) {
            newPodiumUsers.push({ ...qualifyingUsers[0], rank: 2 });
          } else {
            // Empty position #2
            newPodiumUsers.push({
              id: 'empty-2',
              username: 'Your spot!',
              avatar: '❓',
              points: 0,
              prize: 0,
              rank: 2,
              message: 'Pay $10+ to claim this spot!',
              timestamp: new Date().toISOString()
            });
          }
          
          // Position #1 (center) - Always show the top-paying user
          newPodiumUsers.push({ ...topUser, rank: 1 });
          
          // Position #3 (right) - Only show if there's a second qualifying user
          if (qualifyingUsers.length > 1) {
            newPodiumUsers.push({ ...qualifyingUsers[1], rank: 3 });
          } else {
            // Empty position #3
            newPodiumUsers.push({
              id: 'empty-3',
              username: 'Your spot!',
              avatar: '❓',
              points: 0,
              prize: 0,
              rank: 3,
              message: 'Pay $10+ to claim this spot!',
              timestamp: new Date().toISOString()
            });
          }
          
          // Set the podium users
          setPodiumUsers(newPodiumUsers);
          console.log('Set podium users with new logic:', newPodiumUsers);
          
          // Show the podium section if we have at least the top user
          setShowPodium(true);
        } else {
          // If no users yet, show empty state
          console.log('No users found in database');
          setLeaderboardData([]);
          setTopUsers([]);
          setShowPodium(false);
        }
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchData();

    // Countdown timer simulation
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 3); // 3 days from now
    
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
      
      setTimeLeft(`${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };
    
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
    
    return () => clearInterval(timerInterval);
  }, []);
  
  useEffect(() => {
    // Function to handle automatic scrolling
    const autoScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // If we're at the end, reset to the beginning
      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise, scroll to the right
        container.scrollTo({ left: currentScroll + 200, behavior: 'smooth' });
      }
    };
    
    // Set up the auto-scroll interval
    const scrollInterval = setInterval(autoScroll, 3000); // Scroll every 3 seconds
    
    return () => clearInterval(scrollInterval);
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
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
      <div className="text-center py-4">
        <h1 
          className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          style={{ fontFamily: "'Livvic', sans-serif", letterSpacing: "1px" }}
        >
          FLEXIT
        </h1>
        <p 
          className="text-2xl font-semibold text-gray-300 mt-2"
          style={{ fontFamily: "'Livvic', sans-serif" }}
        >
          Pay to flex on the leaderboard
        </p>
      </div>

      
      {/* Removed checkout section from here - will be shown as a modal */}
      
      {/* Podium section - only shown for users who meet the criteria */}
      {showPodium && (
        <div className="relative px-6 pt-2 pb-6 overflow-hidden bg-[#1a1d2e] rounded-lg mx-4 mb-4">
          <div className="flex justify-center items-end space-x-4 mt-4">
            {/* Second place (left) */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-[#2c3252] to-[#1e2139] rounded-t-3xl pt-4 pb-10 px-8 w-64 flex flex-col items-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl mb-4 relative">
                  <span className="text-4xl">{podiumUsers && podiumUsers.length > 0 ? podiumUsers[0].avatar : '🏆'}</span>
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">#2</div>
                </div>
                <h3 className="font-bold text-xl mb-1">{podiumUsers && podiumUsers.length > 0 ? podiumUsers[0].username : 'Player 2'}</h3>
                
                <div className="text-gray-300 mt-3 text-center text-sm italic">"{podiumUsers && podiumUsers.length > 0 && podiumUsers[0].message ? podiumUsers[0].message : 'Coming for the crown!'}"</div>
                
                <div className="flex items-center mt-4">
                  <span className="text-green-400 mr-2">$</span>
                  <span className="font-bold text-xl">{podiumUsers && podiumUsers.length > 0 ? podiumUsers[0].prize.toFixed(2) : '99.99'}</span>
                </div>
                <div className="text-gray-400 text-xs">{podiumUsers && podiumUsers.length > 0 ? formatDate(podiumUsers[0].timestamp || '') : formatDate('')}</div>
              </div>
            </div>
            
            {/* First place (center) */}
            <div className="flex flex-col items-center -mt-8">
              <div className="bg-gradient-to-b from-[#2c3252] to-[#1e2139] rounded-t-3xl pt-4 pb-10 px-8 w-72 flex flex-col items-center">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-5 rounded-2xl mb-4 relative">
                  <span className="text-5xl">{podiumUsers && podiumUsers.length > 1 ? podiumUsers[1].avatar : '👑'}</span>
                  <div className="absolute -top-3 -right-3 bg-yellow-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">#1</div>
                </div>
                <h3 className="font-bold text-2xl mb-1">{podiumUsers && podiumUsers.length > 1 ? podiumUsers[1].username : 'Player 1'}</h3>
                
                <div className="text-gray-300 mt-3 text-center text-sm italic">"{podiumUsers && podiumUsers.length > 1 && podiumUsers[1].message ? podiumUsers[1].message : 'King of the hill!'}"</div>
                
                <div className="flex items-center mt-4">
                  <span className="text-green-400 mr-2">$</span>
                  <span className="font-bold text-2xl">{podiumUsers && podiumUsers.length > 1 ? podiumUsers[1].prize.toFixed(2) : '999.99'}</span>
                </div>
                <div className="text-gray-400 text-xs">{podiumUsers && podiumUsers.length > 1 ? formatDate(podiumUsers[1].timestamp || '') : formatDate('')}</div>
              </div>
            </div>
            
            {/* Third place (right) */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-[#2c3252] to-[#1e2139] rounded-t-3xl pt-4 pb-10 px-8 w-64 flex flex-col items-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl mb-4 relative">
                  <span className="text-4xl">{podiumUsers && podiumUsers.length > 2 ? podiumUsers[2].avatar : '🥉'}</span>
                  <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">#3</div>
                </div>
                <h3 className="font-bold text-xl mb-1">{podiumUsers && podiumUsers.length > 2 ? podiumUsers[2].username : 'Player 3'}</h3>
                
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
      )}
      
      {/* CLAIM SPOT NOW button */}
      <div className="flex justify-center my-4">
        <button 
          onClick={() => setShowCheckoutForm(true)} 
          className="py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
        >
          <span className="mr-2">🔥</span>
          <span>CLAIM SPOT NOW</span>
        </button>
      </div>
      
      {/* Leaderboard table */}
      <div className="px-4 pb-6">
        <table className="w-full border-collapse">
          <thead className="bg-[#2c3252] text-gray-300 text-sm uppercase">
            <tr>
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
