import React, { useState, useEffect } from "react";
import axios from "axios";

let ApiUrl = import.meta.env.VITE_API_URL;

export default function ResultStats() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const email = "satyamranatc@gmail.com"; // or pass as prop if needed

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!email) {
          setError("User email not found");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${ApiUrl}/all-result`, {
          params: { email },
        });

        setResults(res.data.results || []);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading results...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (results.length === 0) {
    return <div className="p-6 text-center text-gray-400">No results found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">📊 Your Result History</h2>
      
      <div className="space-y-4">
        {results.map((r, index) => (
          <div 
            key={index} 
            className="p-5 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-gray-800">
                {r.questionId ? `Question #${r.questionId}` : "Untitled Question"}
              </h3>
              <span className="text-sm text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-gray-700 mb-3">
              <span className="font-medium">Question:</span> {r.question}
            </p>
            <p className="text-gray-700 mb-3">
              <span className="font-medium">Your Answer:</span> {r.userAnswer}
            </p>

            {r.evaluation && (
              <div className="bg-indigo-50 p-4 rounded-xl mt-3">
                <p className="text-gray-800">
                  <span className="font-medium">Correctness:</span> {r.evaluation.correctness}
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Score:</span> {r.evaluation.score} / 100
                </p>
                <p className="text-gray-700 mt-2">
                  <span className="font-medium">Explanation:</span> {r.evaluation.explanation}
                </p>
                {r.evaluation.improvementTips && (
                  <p className="text-gray-700 mt-1">
                    <span className="font-medium">Tips:</span> {r.evaluation.improvementTips}
                  </p>
                )}
                {r.evaluation.complexity && (
                  <p className="text-gray-600 mt-1 text-sm">
                    <span className="font-medium">Level:</span> {r.evaluation.complexity}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
