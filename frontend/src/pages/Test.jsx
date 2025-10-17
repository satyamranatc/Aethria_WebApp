import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiUrl = import.meta.env.VITE_API_URL || 'https://aethria-webapp.onrender.com';

export default function Test() {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSolution = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual user email from your auth context
      const userEmail = 'satyamranatc@gmail.com'; // Get this from your auth state
      
      const response = await axios.get(`${ApiUrl}/get-solution`, {
        params: { email: userEmail }
      });
      
      if (response.data.code) {
        setSolution(response.data);
        console.log('Solution fetched:', response.data);
      } else {
        setError('No new solution available');
      }
    } catch (err) {
      console.error('Error fetching solution:', err);
      setError(err.response?.data?.message || 'Failed to fetch solution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">VS Code Solution Viewer</h2>
        
        <button
          onClick={getSolution}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Loading...' : 'Get VS Code Solution'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {solution && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">
                Language: <span className="text-blue-600">{solution.language}</span>
              </span>
              <span className="text-xs text-gray-500">
                {new Date(solution.updatedAt || Date.now()).toLocaleString()}
              </span>
            </div>
            
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <code>{solution.code}</code>
            </pre>
          </div>
        )}

        {!solution && !error && !loading && (
          <div className="mt-4 text-gray-500 text-center py-8">
            Click the button to fetch the latest solution from VS Code
          </div>
        )}
      </div>
    </div>
  );
}