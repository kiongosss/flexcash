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
import { useRouter } from 'next/navigation';

export default function PaymentModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!handle) {
      setError('Please enter a social handle or website URL');
      return;
    }

    if (!amount || parseFloat(amount) < 1) {
      setError('Please enter an amount of $1 or more');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For development, use the mock checkout endpoint
      // In production, this would call the Lemon Squeezy checkout API
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // Use mock checkout for development
        window.location.href = `/api/mock-checkout?handle=${encodeURIComponent(handle)}&amount=${encodeURIComponent(amount)}`;
        return;
      }
      
      // Production code - Call our API to create a checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle,
          amount: parseFloat(amount),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }
      
      // Redirect to the checkout URL
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Failed to create checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transition-colors"
      >
        Claim Your Spot
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4">
              <h3 className="text-xl font-bold text-white">Claim Your Spot</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
                  Social Handle or Website URL
                </label>
                <input
                  type="text"
                  id="handle"
                  placeholder="@username or website.com"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    placeholder="10.00"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum $1.00. The more you pay, the higher your ranking!</p>
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
