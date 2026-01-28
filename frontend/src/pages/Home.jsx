import React from "react";
import {
  Code,
  Mic,
  Brain,
  Zap,
  Users,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
} from "lucide-react";

// Feature Text Component (Hero Highlights)
function FeatureText({ text }) {
  return (
    <div className="flex items-center bg-white/50 px-4 py-2 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
      <span className="text-gray-700 font-medium text-sm">{text}</span>
    </div>
  );
}

export default function Home() {
  const navigate = (path) => {
    // Navigate logic
    console.log(`Navigating to: ${path}`);
    // Actual navigation would go here, e.g. history.push(path)
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo / Badge */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl ring-1 ring-gray-900/5">
                  <Code className="h-10 w-10 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
              Meet{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Aethria
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
              Your intelligent, voice-powered coding mentor. Debug, explore, and
              understand code like never before —
              <span className="text-indigo-600 font-semibold">
                {" "}
                with the wisdom of AI
              </span>
              .
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4">
              <button
                onClick={() => navigate("/ProjectAssistant")}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-lg hover:shadow-indigo-500/30"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Start Coding
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => alert("Voice Commands coming soon")}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm"
              >
                <Mic className="mr-2 h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                Voice Commands
              </button>
            </div>

            {/* Value Props / Pills */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
              <FeatureText text="Browser & VS Code" />
              <FeatureText text="Voice-Powered" />
              <FeatureText text="Real-time Debugging" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Why Choose Aethria?
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Experience coding assistance that thinks, listens, and responds
              like your personal senior software engineer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              icon={Mic}
              title="Voice-Powered"
              description="Simply speak your questions. No more context-switching to type long queries or search through docs."
              color="blue"
            />
            <FeatureCard
              icon={Brain}
              title="Deep Understanding"
              description="Aethria understands context, patterns, and architectural implications, not just syntax."
              color="indigo"
            />
            <FeatureCard
              icon={Users}
              title="Expert Mentorship"
              description="Get advice styled like industry legends. Learn 'why' not just 'how'."
              color="emerald"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Debugging"
              description="Spot bugs in real-time with proactive explanations and one-click fixes."
              color="orange"
            />
            <FeatureCard
              icon={Code}
              title="Everywhere You Code"
              description="Seamlessly syncs between the web hub and your VS Code extension."
              color="purple"
            />
            <FeatureCard
              icon={Star}
              title="Adaptive Learning"
              description="The more you code, the better Aethria gets at predicting your needs."
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-50"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of developers who are coding smarter, faster, and
            happier with Aethria.
          </p>

          <button
            onClick={() => navigate("/ProjectAssistant")}
            className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-indigo-600 transition-all duration-200 bg-white rounded-xl hover:bg-indigo-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white shadow-xl"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}

// Modern Feature Card
function FeatureCard({ icon: Icon, title, description, color }) {
  // Map colors to tailwind classes
  const colors = {
    blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
    indigo:
      "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white",
    emerald:
      "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white",
    orange:
      "text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white",
    purple:
      "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white",
    pink: "text-pink-600 bg-pink-50 group-hover:bg-pink-600 group-hover:text-white",
  };

  const themeClass = colors[color] || colors.blue;

  return (
    <div className="group relative p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${themeClass}`}
      >
        <Icon className="h-7 w-7 transition-colors duration-300" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-base">{description}</p>
    </div>
  );
}
