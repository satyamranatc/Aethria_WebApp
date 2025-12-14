import React from 'react'
import { Code, Mic, Brain, Zap, Users, Star, ArrowRight, Play, CheckCircle } from 'lucide-react'

// Feature Text Component (for hero highlights)
function FeatureText({ text }) {
  return (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      {text}
    </div>
  )
}

export default function Home() {
  const navigate = (path) => {
    // Mock navigation function - replace with your actual navigation logic
    console.log(`Navigating to: ${path}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 py-20 sm:py-32">
        <div></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Code className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Meet <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Aethria</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Your intelligent, voice-powered coding mentor. Debug, explore, and understand code like never before — 
              <span className="text-indigo-600 font-semibold"> with the wisdom of Ai</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button onClick={() => navigate('/CodeAssistant')} className="group bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Start Coding with Aethria
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => alert("Voice Commands coming soon")} className="group bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                <Mic className="mr-2 h-5 w-5" />
                Try Voice Commands
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <FeatureText text="Works in Browser & VS Code" />
              <FeatureText text="Voice-Powered Intelligence" />
              <FeatureText text="Legendary Mentor Voices" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aethria?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience coding assistance that thinks, listens, and responds like your personal programming mentor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Mic}
              title="Voice-Powered Interaction"
              description="Simply speak your questions and get intelligent responses. No more typing long queries or searching through documentation."
              gradient="from-blue-500 to-cyan-500"
            />
            
            <FeatureCard 
              icon={Brain}
              title="AI-Driven Understanding"
              description="Aethria doesn't just read your code — it understands context, patterns, and can explain complex concepts in simple terms."
              gradient="from-indigo-500 to-purple-500"
            />
            
            <FeatureCard 
              icon={Users}
              title="Legendary Mentor Voices"
              description="Learn from the Ai. Get coding advice in the best simplest way possible."
              gradient="from-emerald-500 to-teal-500"
            />
            
            <FeatureCard 
              icon={Zap}
              title="Instant Debugging"
              description="Point out bugs and get immediate explanations and solutions. Aethria spots issues you might miss."
              gradient="from-orange-500 to-red-500"
            />
            
            <FeatureCard 
              icon={Code}
              title="Multi-Platform Support"
              description="Works seamlessly in your browser and VS Code. Same intelligence, everywhere you code."
              gradient="from-violet-500 to-purple-500"
            />
            
            <FeatureCard 
              icon={Star}
              title="Personalized Learning"
              description="Adapts to your coding style and skill level. Grows with you from beginner to expert."
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Coding Experience?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join a community developers who are coding smarter, not harder, with Aethria.
          </p>
          
          <button onClick={() => navigate('/CodeAssistant')} className="group bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center mx-auto">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-4 relative z-10">{title}</h3>
      <p className="text-gray-600 leading-relaxed relative z-10">{description}</p>
      
      {/* Subtle hover gradient border effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${gradient}`} 
           style={{ background: `linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(59, 130, 246, 0.05))` }}>
      </div>
      
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} p-[1px]`}>
          <div className="w-full h-full bg-white rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}