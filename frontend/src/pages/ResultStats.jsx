import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Award, Target, Zap, Loader } from "lucide-react";

const ApiUrl = import.meta.env.VITE_API_URL;

export default function ResultsDashboard() {
  const { user } = useUser();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        if (!user?.primaryEmailAddress?.emailAddress) {
          setError("User email not found");
          setLoading(false);
          return;
        }

        const email = user.primaryEmailAddress.emailAddress;
        const res = await fetch(
          `${ApiUrl}/all-result?email=${encodeURIComponent(email)}`,
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setResults(data.results || []);
        setError("");
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to fetch results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResults();
    }
  }, [user]);

  // Calculate analytics
  const calculateStats = () => {
    if (results.length === 0) return null;

    const scores = results.map((r) => r.evaluation?.overallScore || 0);
    const avgScore = (
      scores.reduce((a, b) => a + b, 0) / scores.length
    ).toFixed(1);
    const maxScore = Math.max(...scores);
    const excellentCount = results.filter(
      (r) => r.evaluation?.verdict === "Excellent",
    ).length;
    const goodCount = results.filter(
      (r) => r.evaluation?.verdict === "Good",
    ).length;

    return {
      avgScore,
      maxScore,
      totalAttempts: results.length,
      excellentCount,
      goodCount,
      excellenceRate: Math.round((excellentCount / results.length) * 100),
    };
  };

  const getChartData = () => {
    return results.map((r, idx) => ({
      attempt: `Q${idx + 1}`,
      score: r.evaluation?.overallScore || 0,
      quality: r.evaluation?.detailedScores?.codeQuality || 0,
      efficiency: r.evaluation?.detailedScores?.efficiency || 0,
      practices: r.evaluation?.detailedScores?.bestPractices || 0,
      correctness: r.evaluation?.detailedScores?.correctness || 0,
    }));
  };

  const getSkillData = () => {
    const skillCounts = {};
    results.forEach((r) => {
      if (r.evaluation?.skillAnalysis?.strengths) {
        r.evaluation.skillAnalysis.strengths.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ name: skill, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const getMasteryData = () => {
    const levels = {};
    results.forEach((r) => {
      const level = r.evaluation?.skillAnalysis?.masteryLevel || "Unknown";
      levels[level] = (levels[level] || 0) + 1;
    });

    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  };

  const stats = calculateStats();
  const chartData = getChartData();
  const skillData = getSkillData();
  const masteryData = getMasteryData();

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader
            className="animate-spin mx-auto mb-4 text-indigo-600"
            size={48}
          />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="bg-red-100 text-red-700 p-6 rounded-xl border border-red-200">
            <p className="text-lg font-semibold mb-2">⚠️ Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-2">📭</p>
          <p className="text-lg text-gray-500">
            No results yet. Start solving problems!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Learning Dashboard
          </h1>
          <p className="text-gray-600">
            Track your coding progress and skill growth
          </p>
        </div>

        {/* Key Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Average Score
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">
                    {stats.avgScore}%
                  </p>
                </div>
                <TrendingUp className="text-indigo-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Highest Score
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.maxScore}%
                  </p>
                </div>
                <Award className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Attempts
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stats.totalAttempts}
                  </p>
                </div>
                <Target className="text-blue-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Excellence Rate
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {stats.excellenceRate}%
                  </p>
                </div>
                <Zap className="text-purple-400" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 md:gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          {["overview", "performance", "skills", "details"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Score Progress
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="attempt" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mastery Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={masteryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={{ fill: "#6b7280", fontSize: 12 }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {masteryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Scores Comparison
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="attempt" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="#6366f1" />
                <Bar dataKey="quality" fill="#8b5cf6" />
                <Bar dataKey="efficiency" fill="#ec4899" />
                <Bar dataKey="practices" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🌟 Top Strengths
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={skillData}
                  layout="vertical"
                  margin={{ left: 120, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Areas to Improve
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {results.slice(0, 5).map(
                  (r, idx) =>
                    r.evaluation?.feedback?.improvementTips && (
                      <div
                        key={idx}
                        className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition"
                      >
                        <p className="text-sm text-amber-900 font-semibold mb-2">
                          Question {idx + 1}
                        </p>
                        <div className="text-sm text-amber-800">
                          {Array.isArray(
                            r.evaluation.feedback.improvementTips,
                          ) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {r.evaluation.feedback.improvementTips.map(
                                (tip, i) => (
                                  <li key={i}>{tip}</li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p>{r.evaluation.feedback.improvementTips}</p>
                          )}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-700">
                      #
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-700">
                      Question
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">
                      Language
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                      Verdict
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 md:px-6 py-4 font-semibold text-gray-600">
                        {idx + 1}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-800 max-w-xs truncate">
                        {r.question}
                      </td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {r.language}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center font-semibold">
                        <span
                          className={`${r.evaluation?.overallScore >= 80 ? "text-green-600" : r.evaluation?.overallScore >= 60 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {r.evaluation?.overallScore}%
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center hidden sm:table-cell">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            r.evaluation?.verdict === "Excellent"
                              ? "bg-green-100 text-green-700"
                              : r.evaluation?.verdict === "Good"
                                ? "bg-blue-100 text-blue-700"
                                : r.evaluation?.verdict === "Needs Improvement"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.evaluation?.verdict}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedResult(r)}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded font-medium hover:bg-indigo-200 transition text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Question Details
                </h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Question</h3>
                  <p className="text-gray-700 mt-1 break-words">
                    {selectedResult.question}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Your Answer</h3>
                  <pre className="bg-gray-100 p-3 rounded mt-1 text-xs overflow-x-auto text-gray-800 break-words whitespace-pre-wrap">
                    {selectedResult.userAnswer}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600">Overall Score</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {selectedResult.evaluation?.overallScore}%
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Verdict</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedResult.evaluation?.verdict}
                    </p>
                  </div>
                </div>

                {selectedResult.evaluation?.feedback?.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Feedback</h3>
                    <p className="text-gray-700 mt-1">
                      {selectedResult.evaluation.feedback.summary}
                    </p>
                  </div>
                )}

                {selectedResult.evaluation?.feedback?.improvementTips && (
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Improvement Tips
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                      {Array.isArray(
                        selectedResult.evaluation.feedback.improvementTips,
                      ) ? (
                        selectedResult.evaluation.feedback.improvementTips.map(
                          (tip, i) => <li key={i}>{tip}</li>,
                        )
                      ) : (
                        <li>
                          {selectedResult.evaluation.feedback.improvementTips}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {selectedResult.evaluation?.skillAnalysis && (
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Skill Analysis
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Mastery Level:</span>{" "}
                        <span className="text-indigo-600 font-semibold">
                          {selectedResult.evaluation.skillAnalysis.masteryLevel}
                        </span>
                      </p>
                      {selectedResult.evaluation.skillAnalysis.strengths
                        ?.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium text-green-600">
                            Strengths:
                          </span>{" "}
                          {selectedResult.evaluation.skillAnalysis.strengths.join(
                            ", ",
                          )}
                        </p>
                      )}
                      {selectedResult.evaluation.skillAnalysis.weaknesses
                        ?.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium text-yellow-600">
                            Areas to Improve:
                          </span>{" "}
                          {selectedResult.evaluation.skillAnalysis.weaknesses.join(
                            ", ",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
