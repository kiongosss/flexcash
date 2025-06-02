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
import ShareButton from './ShareButton';
import LeaderboardFilter from './LeaderboardFilter';

// Define the User type based on our Prisma schema
type User = {
  id: string;
  handle: string;
  amountPaid: number;
  createdAt: string;
  paymentStatus?: string;
};

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');

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
        setFilteredUsers(data.users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  // Apply filter when currentFilter changes
  useEffect(() => {
    if (users.length === 0) return;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let filtered;
    switch (currentFilter) {
      case 'today':
        filtered = users.filter(user => new Date(user.createdAt) >= today);
        break;
      case 'week':
        filtered = users.filter(user => new Date(user.createdAt) >= weekStart);
        break;
      case 'month':
        filtered = users.filter(user => new Date(user.createdAt) >= monthStart);
        break;
      default:
        filtered = [...users];
    }
    
    setFilteredUsers(filtered);
  }, [currentFilter, users]);
  
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format amount to USD currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-8 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">No entries yet!</h3>
        <p className="text-yellow-600 mb-4">Be the first to claim your spot on the leaderboard.</p>
      </div>
    );
  }

  // Add event listener for filter changes
  useEffect(() => {
    const handleFilterEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCurrentFilter(customEvent.detail);
    };
    
    document.addEventListener('filter-change', handleFilterEvent);
    
    return () => {
      document.removeEventListener('filter-change', handleFilterEvent);
    };
  }, []);

  return (
    <>
      <LeaderboardFilter activeFilter={currentFilter} />
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Rank</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Handle</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount Paid</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No entries found for this time period
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={index === 0 ? 'bg-yellow-50 border-2 border-yellow-300' : ''}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {index === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        👑 {index + 1}
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {user.handle.startsWith('@') ? (
                      user.handle
                    ) : (
                      <Link href={user.handle.startsWith('http') ? user.handle : `https://${user.handle}`} target="_blank" className="text-indigo-600 hover:text-indigo-900">
                        {user.handle}
                      </Link>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={index === 0 ? 'font-bold text-yellow-600' : ''}>
                      {formatCurrency(user.amountPaid)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <ShareButton 
                      handle={user.handle} 
                      rank={index + 1} 
                      amount={user.amountPaid} 
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
