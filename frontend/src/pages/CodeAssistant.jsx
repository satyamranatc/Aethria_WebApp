import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

let ApiUrl = import.meta.env.VITE_API_URL;

export default function CodeAssistant() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userCodes, setUserCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  // Fetch email from Clerk and then fetch codes
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      const userEmail = user.primaryEmailAddress.emailAddress;
      setEmail(userEmail);
      fetchUserCodes(userEmail);
    }
  }, [isLoaded, isSignedIn, user]);

  const fetchUserCodes = async (userEmail) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${ApiUrl}/all-code`, {
        params: { email: userEmail }
      });
      if (response.status === 200) {
        setUserCodes(response.data.codes);
      }
    } catch (err) {
      setError(err.message || 'Error fetching user codes');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Please sign in to view your code</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Code Assistant</h1>
      <p className="text-gray-600 mb-6">Viewing queries for: {email}</p>

      {/* Loading / Error */}
      {loading && <p>Loading your queries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* List of User Codes */}
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Your Queries</h2>
        {userCodes.length === 0 ? (
          <p className="text-gray-500">No queries found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {userCodes.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-xl shadow-md">
                <p><strong>Code:</strong> {item.code}</p>
                <p><strong>Language:</strong> {item.language || 'N/A'}</p>
                <p className="text-gray-500 text-sm">
                  Asked At: {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}