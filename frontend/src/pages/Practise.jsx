import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'

let ApiUrl = import.meta.env.VITE_API_URL

export default function Practise() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [email, setEmail] = useState('');

  const Questions = [
    {
      q: "WAP to Add Two Numbers",
      hint: "make a function, accept two numbers and return their sum",
    },
    {
      q: "WAP to print the sum of 1 to 10",
      hint: "make a function",
    },
    {
      q: "WAP to print the table of 1 to 10",
      hint: "make a function, accept a number and print the table of that number",
    }
  ]

  // Fetch email from Clerk user on component mount
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, isSignedIn, user]);

  async function solveInVsCode(question) {
    try {
      if (!email.trim()) {
        alert("Please sign in to send code to VS Code!");
        return;
      }

      const payload = {
        email,
        code: question.q,
        language: 'javascript',
      };

      const response = await axios.post(`${ApiUrl}/upload-code`, payload);
      if (response.status === 200) {
        alert("✅ Sent to VS Code!");
      }
    } catch (error) {
      alert("❌ Error sending to VS Code: " + (error.message || "Unknown error"));
    }
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Please sign in to access Practice</h1>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">Practice</h1>
      <p className="text-gray-600 mb-6">Signed in as: {email}</p>

      <div className="flex flex-wrap justify-center gap-4">
        {Questions.map((question, index) => (
          <div className='bg-white p-6 rounded-xl shadow-lg w-full max-w-sm' key={index}>
            <h2 className="text-lg font-semibold mb-2">{question.q}</h2>
            <p className="text-gray-600 mb-4">{question.hint}</p>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              onClick={() => solveInVsCode(question)}
            >
              Solve in VS Code
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}