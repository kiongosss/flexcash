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

import { useState } from 'react';

// Using a data-* attribute pattern for client components
type FilterProps = {
  activeFilter: string;
  'data-filter-change'?: string;
};

export default function LeaderboardFilter({ activeFilter, 'data-filter-change': dataFilterChange }: FilterProps) {
  const filters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
  ];
  
  const handleFilterChange = (filterId: string) => {
    // Use custom event for interactivity
    const event = new CustomEvent('filter-change', { detail: filterId });
    document.dispatchEvent(event);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Filter</h3>
          <p className="mt-1 text-sm text-gray-500">Filter leaderboard by time period</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeFilter === filter.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
}
