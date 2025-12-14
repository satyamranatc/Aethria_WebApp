import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useUser } from "@clerk/clerk-react";
import { Send, Code as CodeIcon, Sparkles } from "lucide-react";

export default function Stackly() {
  const { user, isSignedIn } = useUser();
  const socket = useSocket();
  const [code, setCode] = useState(
    '// Write your code here and send it to VS Code\nconsole.log("Hello Aethria!");'
  );

  const handleSendToVSCode = () => {
    if (!isSignedIn) {
      alert("Please sign in to use Stackly.");
      return;
    }
    if (!socket) {
      alert("Functionality not available. Socket not connected.");
      return;
    }

    const email = user.primaryEmailAddress.emailAddress;

    // Emit 'send_data' event with type 'CODE'
    socket.emit("send_data", {
      email,
      type: "CODE",
      content: code,
      language: "javascript", // Default for now, could be dynamic
    });

    alert("🚀 Code sent to VS Code!");
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <h1 className="text-2xl font-bold mb-4">
          Please Sign In to use Stackly
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
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
            Open Source React-powered page builder (Coming Soon). <br />
            For now, use this to{" "}
            <span className="font-semibold">
              instantly send code to VS Code
            </span>
            .
          </p>
        </div>

        {/* Editor Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Coordinator Editor
            </h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center">
                {socket ? "🟢 Connected to VS Code" : "🔴 Disconnected"}
              </span>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 border-2 border-gray-200 rounded-xl font-mono text-sm focus:border-indigo-500 focus:outline-none resize-none bg-slate-900 text-slate-50"
            spellCheck="false"
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSendToVSCode}
              disabled={!socket}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5 mr-2" />
              Send to VS Code
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Tip: If you have text selected in VS Code, this will replace it.
            Otherwise, it appends.
          </p>
        </div>
      </div>
    </div>
  );
}
