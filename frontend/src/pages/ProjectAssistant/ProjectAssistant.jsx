import React from 'react';
import { Layers, Code2, Palette, Zap, Download, ArrowRight, CheckCircle } from 'lucide-react';

export default function ProjectAssistant() {
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // Replace with actual navigation
    window.open('https://dadwebv1.onrender.com/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Glassmorphism Card */}
      <div className="relative max-w-7xl w-full">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-xl shadow-2xl"></div>
        
        {/* Main Content */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
          
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Stackly
                  </h1>
                  <p className="text-sm text-gray-500">By Aethria</p>
                </div>
              </div>
              
              <div className="hidden md:block px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-full">
                Open Source
              </div>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              A React-powered <span className="font-semibold text-indigo-600">drag-and-drop page builder</span> that generates 
              production-ready React or HTML code
              but <span className="font-semibold text-indigo-600">open-source and developer-oriented</span>.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <FeatureBadge 
                icon={Palette}
                title="Drag & Drop Builder"
                description="Visual interface for rapid UI prototyping"
              />
              <FeatureBadge 
                icon={Code2}
                title="Export Real Code"
                description="Production-ready React or HTML output"
              />
              <FeatureBadge 
                icon={Zap}
                title="Developer-Friendly"
                description="Open-source, customizable, no vendor lock-in"
              />
            </div>

            {/* Use Cases */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-indigo-600 mr-2" />
                Perfect For:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-semibold text-indigo-600">Developers:</span> Prototype UIs quickly and export starter code
                </div>
                <div>
                  <span className="font-semibold text-indigo-600">Designers:</span> Design visually but export real, usable code
                </div>
                <div>
                  <span className="font-semibold text-indigo-600">Learners:</span> Understand React components and code generation
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => navigate('/stackly')}
              className="group w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center"
            >
              <Layers className="mr-3 h-6 w-6" />
              Open Stackly Builder
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Footer note */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Directly synced with Aethria Extension for enhanced productivity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, title, description }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-indigo-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}