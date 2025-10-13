import React, { useState, useEffect } from 'react';
import axios from 'axios';

let ApiUrl = import.meta.env.VITE_API_URL; // Make sure to set this in your .env

export default function CodeAssistant() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [userCodes, setUserCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch codes whenever submittedEmail changes
  useEffect(() => {
    if (!submittedEmail) return;

    const fetchUserCodes = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${ApiUrl}/all-code`, {
          params: { email: submittedEmail }
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

    fetchUserCodes();
  }, [submittedEmail]);

  const handleSubmit = () => {
    if (!email.trim()) {
      alert('Please enter your email!');
      return;
    }
    setSubmittedEmail(email.trim());
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Code Assistant</h1>

      {/* Email Input */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-64"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p>Loading your queries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* List of User Codes */}
      {submittedEmail && (
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-2">Queries for: {submittedEmail}</h2>
          {userCodes.length === 0 ? (
            <p>No queries found.</p>
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
      )}
    </div>
  );
}
