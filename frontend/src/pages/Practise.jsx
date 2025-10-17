import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { Code, CheckCircle, XCircle, Send, Sparkles, ArrowLeft, Download } from 'lucide-react'

let ApiUrl = import.meta.env.VITE_API_URL

export default function Practice() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [email, setEmail] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [result, setResult] = useState(null);

  const Questions = [
    {
      id: 1,
      q: "WAP to Add Two Numbers",
      hint: "Create a function that accepts two numbers and returns their sum",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "5, 3",
      sampleOutput: "8",
      explanation: "The function should take two numbers as parameters and return their sum."
    },
    {
      id: 2,
      q: "WAP to Print Sum of 1 to 10",
      hint: "Use a loop to calculate the sum of numbers from 1 to 10",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "N/A",
      sampleOutput: "55",
      explanation: "Sum of numbers from 1 to 10 is 1+2+3+...+10 = 55"
    },
    {
      id: 3,
      q: "WAP to Print Multiplication Table",
      hint: "Create a function that accepts a number and prints its multiplication table",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "5",
      sampleOutput: "5, 10, 15, 20, 25, 30, 35, 40, 45, 50",
      explanation: "Print the multiplication table of the given number from 1 to 10"
    },
    {
      id: 4,
      q: "WAP to Check if Number is Prime",
      hint: "Create a function that returns true if a number is prime, false otherwise",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "17",
      sampleOutput: "true",
      explanation: "A prime number is only divisible by 1 and itself. 17 is prime."
    },
    {
      id: 5,
      q: "WAP to Reverse a String",
      hint: "Create a function that takes a string and returns it reversed",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "hello",
      sampleOutput: "olleh",
      explanation: "Reverse the characters in the string"
    },
    {
      id: 6,
      q: "WAP to Find Factorial of a Number",
      hint: "Use recursion or a loop to calculate factorial",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "5",
      sampleOutput: "120",
      explanation: "Factorial of 5 is 5! = 5 × 4 × 3 × 2 × 1 = 120"
    },
    {
      id: 7,
      q: "WAP to Check if String is Palindrome",
      hint: "Compare the string with its reverse",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "racecar",
      sampleOutput: "true",
      explanation: "A palindrome reads the same forwards and backwards"
    },
    {
      id: 8,
      q: "WAP to Find Largest Number in Array",
      hint: "Iterate through array and track the maximum value",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "[3, 7, 2, 9, 1]",
      sampleOutput: "9",
      explanation: "Compare all elements and return the largest"
    },
    {
      id: 9,
      q: "WAP to Count Vowels in a String",
      hint: "Check each character against vowels (a, e, i, o, u)",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "hello",
      sampleOutput: "2",
      explanation: "Count of vowels 'e' and 'o' in 'hello' is 2"
    },
    {
      id: 10,
      q: "WAP to Generate Fibonacci Series",
      hint: "Generate first n numbers of Fibonacci sequence",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "8",
      sampleOutput: "0, 1, 1, 2, 3, 5, 8, 13",
      explanation: "First 8 Fibonacci numbers where each number is sum of previous two"
    },
    {
      id: 11,
      q: "WAP to Remove Duplicates from Array",
      hint: "Use Set or filter method to remove duplicate values",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "[1, 2, 2, 3, 3, 3, 4]",
      sampleOutput: "[1, 2, 3, 4]",
      explanation: "Remove duplicate elements keeping only unique values"
    },
    {
      id: 12,
      q: "WAP to Sort Array in Ascending Order",
      hint: "Implement bubble sort or use built-in sort method",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "[5, 2, 8, 1, 9]",
      sampleOutput: "[1, 2, 5, 8, 9]",
      explanation: "Sort array elements in ascending order"
    },
    {
      id: 13,
      q: "WAP to Find Sum of Array Elements",
      hint: "Use reduce or a loop to sum all elements",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "[1, 2, 3, 4, 5]",
      sampleOutput: "15",
      explanation: "Sum all elements: 1+2+3+4+5 = 15"
    },
    {
      id: 14,
      q: "WAP to Check if Number is Armstrong",
      hint: "Sum of cubes of digits equals the number itself",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "153",
      sampleOutput: "true",
      explanation: "153 = 1³ + 5³ + 3³ = 1 + 125 + 27 = 153"
    },
    {
      id: 15,
      q: "WAP to Find GCD of Two Numbers",
      hint: "Use Euclidean algorithm",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "48, 18",
      sampleOutput: "6",
      explanation: "GCD (Greatest Common Divisor) of 48 and 18 is 6"
    },
    {
      id: 16,
      q: "WAP to Convert Celsius to Fahrenheit",
      hint: "Formula: (C × 9/5) + 32",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "0",
      sampleOutput: "32",
      explanation: "0°C = 32°F. Formula: (C × 9/5) + 32"
    },
    {
      id: 17,
      q: "WAP to Find Second Largest Number",
      hint: "Track both largest and second largest while iterating",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "[3, 7, 2, 9, 1, 5]",
      sampleOutput: "7",
      explanation: "Largest is 9, second largest is 7"
    },
    {
      id: 18,
      q: "WAP to Merge Two Sorted Arrays",
      hint: "Use two pointers to merge arrays maintaining sorted order",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "[1, 3, 5], [2, 4, 6]",
      sampleOutput: "[1, 2, 3, 4, 5, 6]",
      explanation: "Merge two sorted arrays into one sorted array"
    },
    {
      id: 19,
      q: "WAP to Check if Array is Sorted",
      hint: "Compare each element with the next one",
      difficulty: "Easy",
      language: "javascript",
      sampleInput: "[1, 2, 3, 4, 5]",
      sampleOutput: "true",
      explanation: "Check if array is sorted in ascending order"
    },
    {
      id: 20,
      q: "WAP to Find Missing Number in Array",
      hint: "Array contains numbers 1 to n with one missing. Use sum formula",
      difficulty: "Medium",
      language: "javascript",
      sampleInput: "[1, 2, 4, 5]",
      sampleOutput: "3",
      explanation: "Numbers should be 1 to 5, but 3 is missing. Use sum formula n(n+1)/2"
    }
  ]

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
        language: question.language,
      };

      const response = await axios.post(`${ApiUrl}/upload-code`, payload);
      if (response.status === 200) {
        alert("✅ Question sent to VS Code!");
        setSelectedQuestion(question);
        setUserAnswer('');
        setResult(null);
      }
    } catch (error) {
      alert("❌ Error: " + (error.message || "Unknown error"));
    }
  }

  async function fetchFromVsCode() {
    if (!email.trim()) {
      alert("Please sign in first!");
      return;
    }

    setIsFetching(true);

    try {
      const response = await axios.get(`${ApiUrl}/get-solution`, {
        params: { email }
      });

      if (response.data.code) {
        setUserAnswer(response.data.code);
        alert("✅ Code fetched from VS Code!");
      } else {
        alert("⚠️ No solution found. Make sure you're writing code in VS Code!");
      }
    } catch (error) {
      alert("❌ Error fetching code: " + (error.response?.data?.message || error.message));
    } finally {
      setIsFetching(false);
    }
  }

  async function checkAnswer() {
    if (!userAnswer.trim()) {
      alert("Please paste your code or fetch it from VS Code!");
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      const payload = {
        email,
        questionId: selectedQuestion.id,
        question: selectedQuestion.q,
        userAnswer,
        language: selectedQuestion.language
      };

      const response = await axios.post(`${ApiUrl}/check-answer`, payload);
      
      if (response.status === 200) {
        setResult(response.data);
      }
    } catch (error) {
      alert("❌ Error checking answer: " + (error.message || "Unknown error"));
    } finally {
      setIsChecking(false);
    }
  }

  function goBack() {
    setSelectedQuestion(null);
    setUserAnswer('');
    setResult(null);
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
          <Code className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Please Sign In</h1>
        <p className="text-gray-600">You need to be signed in to access Practice</p>
      </div>
    )
  }

  // Answer submission view
  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={goBack}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Questions
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedQuestion.q}</h2>
                
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-3">{selectedQuestion.hint}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Sample Input:</h4>
                  <p className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-700 mb-4">{selectedQuestion.sampleInput}</p>

                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Sample Output:</h4>
                  <p className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-700 mb-4">{selectedQuestion.sampleOutput}</p>

                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Explanation:</h4>
                  <p className="text-sm text-gray-700">{selectedQuestion.explanation}</p>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Your Solution:
                    </label>
                    <button
                      onClick={fetchFromVsCode}
                      disabled={isFetching}
                      className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isFetching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Fetch from VS Code
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Paste your code here or click 'Fetch from VS Code' button..."
                    className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={checkAnswer}
                  disabled={isChecking}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Checking with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Check Answer with AI
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div className={`rounded-2xl shadow-xl p-8 ${result.isPassed ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                  <div className="flex items-center mb-4">
                    {result.isPassed ? (
                      <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600 mr-3" />
                    )}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {result.isPassed ? '✅ Correct!' : '❌ Needs Improvement'}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-semibold text-gray-900 mb-2">Score: {result.score}/100</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${result.isPassed ? 'bg-green-600' : 'bg-red-600'}`}
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-2">AI Feedback:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{result.feedback}</p>
                  </div>

                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="bg-white rounded-lg p-6 mt-4">
                      <h4 className="font-bold text-gray-900 mb-2">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-gray-700">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Questions list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Code className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Practice <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Coding</span>
          </h1>
          <p className="text-gray-600 text-lg">Signed in as: <span className="font-semibold text-indigo-600">{email}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Questions.map((question) => (
            <div 
              key={question.id}
              className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-bold text-indigo-600">#{question.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {question.q}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-1">
                  {question.hint}
                </p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                  <p className="text-gray-700 font-semibold mb-1">Sample: {question.sampleInput} → {question.sampleOutput}</p>
                </div>
                
                <button
                  onClick={() => solveInVsCode(question)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Solve in VS Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}