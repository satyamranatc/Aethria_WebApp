import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  Send,
  Code as CodeIcon,
  Laptop,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ApiUrl = import.meta.env.VITE_API_URL;

export default function Stackly() {
  const { user, isSignedIn } = useUser();
  const [code, setCode] = useState(
    '// Write your code here and send it to VS Code\nconsole.log("Hello Aethria!");',
  );
  const [isSending, setIsSending] = useState(false);

  const handleSendToVSCode = async () => {
    if (!isSignedIn) {
      alert("Please sign in to use Stackly.");
      return;
    }

    const email = user.primaryEmailAddress.emailAddress;

    try {
      setIsSending(true);

      // Use Command System (Robust polling-based sync)
      await axios.post(`${ApiUrl}/create-command`, {
        email,
        type: "APPLY_EDIT",
        payload: {
          code: code,
        },
      });

      alert("🚀 Code queued for VS Code! (Extension will pick it up shortly)");
    } catch (error) {
      console.error("Send error:", error);
      alert(
        "❌ Failed to send code: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Please Sign In to use Stackly
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-4">
            <CodeIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stackly <span className="text-indigo-600">by Aethria</span>
          </h1>
          <p className="text-gray-600">
            Rapidly prototype and sync snippets with your local environment.
          </p>
        </div>

        {/* Editor Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Laptop size={20} className="text-gray-500" /> Remote Editor
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
              <CheckCircle size={12} /> System Active
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 border-2 border-slate-200 rounded-xl font-mono text-sm focus:border-indigo-500 focus:outline-none resize-none bg-[#1e293b] text-slate-300 leading-relaxed"
            spellCheck="false"
            placeholder="// Type your code here..."
          />

          <div className="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Replaces selected text in active VS Code editor.</span>
            </div>

            <button
              onClick={handleSendToVSCode}
              disabled={isSending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isSending ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {isSending ? "Sending..." : "Send to VS Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
